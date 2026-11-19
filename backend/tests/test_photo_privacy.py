"""Stored photos carry no embedded metadata, above all no GPS position (NFR15, NFR7)."""
import io

import pillow_heif
import pytest
from PIL import Image

from app.errors import ApiError
from app.platform_services import sanitize_photo

from conftest import make_jpeg, sign_in, submit

pillow_heif.register_heif_opener()


def _exif_with_gps_and_camera(orientation: int | None = None) -> Image.Exif:
    exif = Image.Exif()
    exif[0x010F] = "SecretCameraMaker"
    exif[0x0132] = "2026:11:19 08:15:00"
    exif[0x8825] = {1: "N", 2: (51.0, 30.0, 0.0), 3: "W", 4: (0.0, 7.0, 0.0)}  # GPS position
    if orientation:
        exif[0x0112] = orientation
    return exif


def _png_with_text(width=12, height=12) -> bytes:
    from PIL.PngImagePlugin import PngInfo

    info = PngInfo()
    info.add_text("Comment", "TextChunkSecret")
    info.add_itxt("XML:com.adobe.xmp", "<x:xmpmeta>XmpSecret</x:xmpmeta>")
    out = io.BytesIO()
    Image.new("RGB", (width, height), (1, 2, 3)).save(out, format="PNG", pnginfo=info, exif=_exif_with_gps_and_camera())
    return out.getvalue()


def _heic_with_exif() -> bytes:
    out = io.BytesIO()
    Image.new("RGB", (16, 16), (9, 9, 9)).save(out, format="HEIF", exif=_exif_with_gps_and_camera())
    return out.getvalue()


# ----------------------------------------------------- the test photos really carry metadata
def test_fixtures_do_carry_gps_before_cleaning():
    jpeg = make_jpeg(exif=_exif_with_gps_and_camera())
    assert Image.open(io.BytesIO(jpeg)).getexif().get_ifd(0x8825)  # GPS is really there
    assert b"SecretCameraMaker" in jpeg
    assert b"TextChunkSecret" in _png_with_text()
    assert Image.open(io.BytesIO(_heic_with_exif())).getexif().get_ifd(0x8825)


# -------------------------------------------------------------------------- unit level
def test_jpeg_metadata_is_removed():
    clean, kind = sanitize_photo(make_jpeg(exif=_exif_with_gps_and_camera()), "image/jpeg")
    assert kind == "image/jpeg"
    img = Image.open(io.BytesIO(clean))
    assert dict(img.getexif()) == {} and img.getexif().get_ifd(0x8825) == {}
    assert b"SecretCameraMaker" not in clean and b"Exif" not in clean and b"2026:11:19" not in clean


def test_png_text_xmp_and_exif_are_removed():
    clean, kind = sanitize_photo(_png_with_text(), "image/png")
    assert kind == "image/png"
    for needle in (b"TextChunkSecret", b"XmpSecret", b"SecretCameraMaker", b"eXIf", b"tEXt", b"iTXt"):
        assert needle not in clean, needle
    assert Image.open(io.BytesIO(clean)).info == {}


def test_heic_is_converted_to_jpeg_without_metadata():
    clean, kind = sanitize_photo(_heic_with_exif(), "image/heic")
    assert kind == "image/jpeg" and clean[:3] == b"\xff\xd8\xff"
    assert dict(Image.open(io.BytesIO(clean)).getexif()) == {} and b"SecretCameraMaker" not in clean


def test_recorded_rotation_is_applied_to_the_pixels_not_lost():
    # A phone photo stored 20 wide and 10 tall with "rotate 90" in its metadata shows 10 wide, 20 tall.
    clean, _ = sanitize_photo(make_jpeg(20, 10, exif=_exif_with_gps_and_camera(orientation=6)), "image/jpeg")
    img = Image.open(io.BytesIO(clean))
    assert img.size == (10, 20) and dict(img.getexif()) == {}


def test_a_file_that_only_looks_like_a_photo_is_rejected():
    with pytest.raises(ApiError) as e:
        sanitize_photo(b"\xff\xd8\xff\xe0" + b"\x00" * 64, "image/jpeg")
    assert e.value.status == 415


def test_a_decompression_bomb_is_rejected():
    out = io.BytesIO()
    Image.new("L", (8000, 8000)).save(out, format="PNG")  # about 64 million pixels, tiny file
    assert len(out.getvalue()) < 1_000_000
    with pytest.raises(ApiError) as e:
        sanitize_photo(out.getvalue(), "image/png")
    assert e.value.status == 413


# -------------------------------------------------------------------- through the service
@pytest.mark.parametrize(
    "photo,content_type",
    [
        (make_jpeg(exif=_exif_with_gps_and_camera()), "image/jpeg"),
        (_png_with_text(), "image/png"),
        (_heic_with_exif(), "image/heic"),
    ],
    ids=["jpeg", "png", "heic"],
)
def test_what_staff_download_has_no_metadata(client, staff, photo, content_type):
    tid = submit(client, photo=photo, content_type=content_type).json()["trackingId"]
    h = sign_in(client, staff["secret"])
    url = client.get(f"/v1/staff/reports/{tid}", headers=h).json()["photoUrl"]
    served = client.get(url, headers=h).content
    assert served != photo
    assert b"SecretCameraMaker" not in served and b"TextChunkSecret" not in served and b"XmpSecret" not in served
    img = Image.open(io.BytesIO(served))
    assert dict(img.getexif()) == {} and img.getexif().get_ifd(0x8825) == {}


def test_stored_file_on_disk_has_no_metadata_either(client):
    from app import config

    submit(client, photo=make_jpeg(exif=_exif_with_gps_and_camera()))
    files = list(config.PHOTO_DIR.glob("*.bin"))
    assert files
    for f in files:
        data = f.read_bytes()
        assert b"SecretCameraMaker" not in data and b"Exif" not in data

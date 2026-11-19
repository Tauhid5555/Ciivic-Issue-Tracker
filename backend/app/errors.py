"""One error shape for every answer: code, message, fieldErrors (contract rules)."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str, field_errors: list[dict] | None = None):
        self.status = status
        self.code = code
        self.message = message
        self.field_errors = field_errors or []


def body(code: str, message: str, field_errors: list[dict] | None = None) -> dict:
    return {"code": code, "message": message, "fieldErrors": field_errors or []}


def install(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _api_error(_: Request, exc: ApiError):
        return JSONResponse(status_code=exc.status, content=body(exc.code, exc.message, exc.field_errors))

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        fields = [
            {"field": ".".join(str(p) for p in e["loc"] if p not in ("body", "query", "form")), "message": e["msg"]}
            for e in exc.errors()
        ]
        return JSONResponse(status_code=422, content=body("validation_failed", "Some fields need attention.", fields))

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException):
        code = {404: "not_found", 405: "method_not_allowed"}.get(exc.status_code, "error")
        return JSONResponse(status_code=exc.status_code, content=body(code, str(exc.detail)))

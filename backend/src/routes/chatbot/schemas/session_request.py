from pydantic import BaseModel


class SessionRequest(BaseModel):
    title: str | None = None
    domain_key: str | None = None


class SessionUpdateRequest(BaseModel):
    title: str | None = None
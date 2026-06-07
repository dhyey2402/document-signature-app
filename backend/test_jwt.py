from app.utils.jwt import create_access_token

token = create_access_token({
    "sub": "1"
})

print(token)


class AppException(Exception):
    def __init__(self,
                 message:str,
                 code:str,
                 status_code:int
                 ):
        self.message = message
        self.code = code
        self.status_code = status_code

# user exceptions

class UserNotFoundError(AppException):
    def __init__(self):
        super().__init__("User not found", "USER_NOT_FOUND", 404)



class UserEmailAlreadyExistsError(AppException):
    def __init__(self):
        super().__init__("User email already exists", "USER_EMAIL_ALREADY_EXISTS", 409)

class UserUsernameAlreadyExistsError(AppException):
    def __init__(self):
        super().__init__("User username already exists", "USER_USERNAME_ALREADY_EXISTS", 409)

class InvalidCredentialsError(AppException):
    def __init__(self):
        super().__init__("Invalid credentials", "INVALID_CREDENTIALS", 401)

class InvalidTokenError(AppException):
    def __init__(self):
        super().__init__("Invalid token", "INVALID_TOKEN", 401)
class UserInactiveError(AppException):
    def __init__(self):
        super().__init__("User is inactive", "USER_INACTIVE", 401)

class UserUnAuthorizedError(AppException):
    def __init__(self):
        super().__init__("User is unauthorized", "USER_UNAUTHORIZED", 401)
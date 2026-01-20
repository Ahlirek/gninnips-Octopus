
'''Errors Module'''
# pylint: disable=line-too-long, useless-super-delegation
# flake8: noqa: E501


class InputDataError(Exception):
    '''Error in input data'''


class NumDataError(InputDataError):
    '''Error in number of input data'''
    E_MISSING_DATA = 'El número de datos ingresados es incorrecto.\
    \nPor favor intentelo de nuevo.'

    def __init__(self, msg=E_MISSING_DATA):
        # Exception.__init__(self, mensaje)
        super().__init__(msg)


class NoDataError(InputDataError):
    '''Error when no input data'''
    E_NO_DATA = 'No se ingresó ningún comando.\
    \nPor favor intentelo de nuevo.'

    def __init__(self, msg=E_NO_DATA):
        super().__init__(msg)


class CommandError(InputDataError):
    '''Error when no valid command entered'''
    E_NO_DATA = 'No se ingresó ningún comando valido.\
    \nPor favor intentelo de nuevo.'

    def __init__(self, msg=E_NO_DATA):
        super().__init__(msg)


class NoValidTimeError(InputDataError):
    '''Error when sum of up and down times aren't divisor for total time'''
    E_TIME_DIV = 'El tiempo/distancia total no corresponde a la suma del tiempo/distancia sentado y parado.\
    \nPor favor intentelo de nuevo.'

    def __init__(self, msg=E_TIME_DIV):
        super().__init__(msg)


class DataError(InputDataError):
    '''Error when data type isn't valid.'''
    E_DATA_VALUE = "Error en el dato '{val}'. No es un dato valido.\
\nPor favor intentelo de nuevo."

    def __init__(self, val, msg=E_DATA_VALUE):
        super().__init__(msg)
        self.val = val
        self.msg = msg

    def __str__(self):
        return self.msg.format(val=self.val)


class RangeError(InputDataError):
    '''Error when values are out of range'''
    E_RANGE = "Valor fuera del rango valido, ingrese valores entre '{min}' y '{max}'"

    def __init__(self, min_val, max_val, msg=E_RANGE):
        super().__init__(msg)
        self.min = min_val
        self.max = max_val
        self.msg = msg

    def __str__(self):
        return self.msg.format(min=self.min, max=self.max)


class FileError(Exception):
    '''Error when problems with file reading/writing.'''


class ExitPrincipalCycle(FileError):
    '''Error trying to exit principal cycle'''
    E_LAST_CYCLE = 'No es posible salir del ciclo principal.\
    \nPor favor revise el formato de su archivo e intentelo de nuevo.'

    def __init__(self, msg=E_LAST_CYCLE):
        super().__init__(msg)

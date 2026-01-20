'''Descriptor Module'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501
from datetime import datetime
from src.errors import RangeError, DataError


class MinMaxRange():
    '''Descriptor Min Max range'''

    def __init__(self, min_default, max_default):
        self.__max_default = max_default
        self.__min_default = min_default
        self.__field_name = None

    def __set_name__(self, owner, name):
        self.__field_name = name

    def __set__(self, instance, value) -> None:

        if not isinstance(value, int):
            try:
                value = int(value)
            except ValueError as error:
                raise DataError(value) from error

        if value < self.__min_default or value > self.__max_default:
            raise RangeError(self.__min_default, self.__max_default)

        instance.__dict__[self.__field_name] = value


class IsTime():
    '''Descriptor IsTime'''

    def __init__(self):
        self.__field_name = None

    def __set_name__(self, owner, name):
        self.__field_name = name

    def __set__(self, instance, value) -> None:
        if instance.is_dist:
            value = datetime.strptime('0', '%S')
        else:
            try:
                value = datetime.strptime(value, '%M:%S')
                if value.minute == 0 and value.second == 0:
                    raise DataError(value.strftime('%M:%S'))
            except ValueError:
                try:
                    value = datetime.strptime(value, '%S')
                    if value.second == 0:
                        # pylint: disable=raise-missing-from
                        raise DataError(value.strftime('%S'))
                except ValueError as error:
                    raise DataError(value) from error

        instance.__dict__[self.__field_name] = value

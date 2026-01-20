'''Unit tests'''
# pylint: disable=line-too-long, import-error
import pytest
from src.classes import Entrenamiento, Saltos
from src.run import create_trnng_obj, split_jump_data
from src.errors import DataError, NumDataError, NoValidTimeError


@pytest.mark.parametrize(
    'test_input, ex_obj',
    [(['7', '60', '110/80', '20:00', '18/2'],
      Saltos('7', '60', '110', '20:00', '80', '18', '2')),
     (['5', '80', '100/85', '4:00', '16/4'],
      Saltos('5', '80', '100', '4:00', '85', '16', '4')),
     ]
)
def test_saltos_split(test_input, ex_obj):
    '''Test Saltos class with split_data function integration'''
    test_input = Saltos(*split_jump_data(test_input))
    assert test_input == ex_obj


@pytest.mark.parametrize(
    'test_input',
    [(['7', '60', '110/80', '20:00', '18/3']),
     ]
)
def test_saltos_split_fail(test_input):
    '''Test Saltos class with split_data function integration'''
    with pytest.raises(ArithmeticError):
        test_input = Saltos(*split_jump_data(test_input))


@pytest.mark.parametrize(
    'test_input, ex_obj',
    [(['3', '77', '95', '21:00'],
      Entrenamiento('3', '77', '95', '21:00')),
     (['5', '80', '100/85', '4:00', '16/4'],
      Saltos('5', '80', '100', '4:00', '85', '16', '4')),
     ]
)
def test_create_trnng_obj(test_input, ex_obj):
    '''Test create_trnng_obj function'''
    test_input = create_trnng_obj(test_input)
    assert test_input == ex_obj


@pytest.mark.parametrize(
    'test_input',
    [(['5', '77', '95', '21:00']),
     (['3', '80', '100/85', '4:00', '16/4']),
     (['a', '80', '100/85', '3:00', '16/4'])
     ]
)
def test_create_trnng_obj_data_len_fail(test_input):
    '''Test create_trnng_obj function'''
    with pytest.raises(NumDataError):
        create_trnng_obj(test_input)


@pytest.mark.parametrize(
    'test_input',
    [(['7', '80', '100/85', '3:00', '16/5']),
     ]
)
def test_create_trnng_obj_time_fail(test_input):
    '''Test create_trnng_obj function'''
    with pytest.raises(NoValidTimeError):
        create_trnng_obj(test_input)


@pytest.mark.parametrize(
    'test_input',
    [(['7', 'a', '100/85', '3:00', '16/4']),
     (['7', '80', 'a/85', '3:00', '16/4']),
     (['7', '80', '100/a', 'a', '16/4']),
     (['7', '80', '100/85', '3:00', 'a/4']),
     (['7', '80', '100/85', '3:00', '16/a']),
     (['a', '77', '95', '21:00']),
     (['6', 'a', '95', '21:00']),
     (['6', '77', 'a', '21:00']),
     (['6', '77', '95', 'a']),
     ]
)
def test_create_trnng_obj_data_fail(test_input):
    '''Test create_trnng_obj function'''
    with pytest.raises(DataError):
        create_trnng_obj(test_input)

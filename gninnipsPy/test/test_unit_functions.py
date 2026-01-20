'''Unit tests for functions'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501
from datetime import datetime
import pytest
from src.run import check_coherent_time, convert_to_time, split_jump_data, split_data
from src.errors import NoDataError, NumDataError, DataError


@pytest.mark.parametrize(
    'inpt_data, ex_min, ex_sec',
    [
        ('1:00', 1, 0),
        ('0:47', 0, 47),
        ('21:0', 21, 0),
        ('10', 0, 10),
    ])
def test_convert_to_time(inpt_data, ex_min, ex_sec):
    '''testing convert_to_time function'''
    inpt_data = convert_to_time(inpt_data)
    assert isinstance(inpt_data, datetime)
    assert inpt_data.minute == ex_min
    assert inpt_data.second == ex_sec


def test_convert_to_time_data_fail():
    '''testing convert_to_time function data failure'''
    with pytest.raises(DataError):
        convert_to_time('a')


@pytest.mark.parametrize(
    'inpt_data',
    [
        (['1:00', '45', '15']),
        (['5:00', '30', '30']),
        (['6:0', '1:00', '30']),
        (['1:30', '45', '45']),
    ])
def test_check_coherent_time(inpt_data):
    '''testing check_coherent_time function'''
    assert not check_coherent_time(*inpt_data)


@pytest.mark.parametrize(
    'inpt_data',
    [
        (['1:00', '50', '15']),
        (['5:00', '1:00', '30']),
        (['6:0', '1:00', '45']),
        (['1:30', '1:00', '45']),
    ])
def test_check_coherent_time_fail(inpt_data):
    '''Test Entrenamiento Class Failures'''
    assert check_coherent_time(*inpt_data)


@pytest.mark.parametrize(
    'inpt_data, ex_trnng, ex_hrth, ex_cad, ex_tot_tm, ex_cad_up, ex_tm_dwn, ex_tm_up',
    [(['7', '80', '100/120', '5:00', '1:00/1:30'],
      '7', '80', '100', '5:00', '120', '1:00', '1:30'),
     (['5', '70', '105/120', '30', '5/10'],
      '5', '70', '105', '30', '120', '5', '10')
     ])
def test_split_jump_data(inpt_data, ex_trnng, ex_hrth, ex_cad, ex_tot_tm, ex_cad_up, ex_tm_dwn, ex_tm_up):
    '''test split_jump_data function'''
    trnng, hrth, cad, tot_tm, cad_up, tm_dwn, tm_up = split_jump_data(
        inpt_data)
    assert trnng == ex_trnng
    assert hrth == ex_hrth
    assert cad == ex_cad
    assert tot_tm == ex_tot_tm
    assert cad_up == ex_cad_up
    assert tm_dwn == ex_tm_dwn
    assert tm_up == ex_tm_up


@pytest.mark.parametrize(
    'test_input, ex_comm',
    [('2 67 100 2:00', ['2', '67', '100', '2:00']),
     ('7 60 110/80 20:00 18/3', ['7', '60', '110/80', '20:00', '18/3']),
     ('s', 's'),
     ('S', 's')
     ]
)
def test_split_data(test_input, ex_comm):
    '''test split_data function'''
    data = split_data(test_input)
    assert data == ex_comm


@pytest.mark.parametrize(
    'test_input',
    ['0 1 2 3 4 5',
     '0 1 2',
     '0 1',
     '6'
     ]
)
def test_split_data_fail(test_input):
    '''test split_data function with error in input data'''
    with pytest.raises(NumDataError):
        split_data(test_input)


def test_split_data_no_data_fail():
    '''test split_data function with no data'''
    with pytest.raises(NoDataError):
        split_data('')

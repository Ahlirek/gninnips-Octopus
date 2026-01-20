'''Unit tests for Classes'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501
from datetime import datetime, timedelta
import pytest
from src.errors import DataError, RangeError
from src.classes import Entrenamiento, Saltos, CicloDeEntrenamiento


@pytest.mark.parametrize(
    'test_input, ex_trn, ex_hrth, ex_cad, ex_tot_tm',
    [(Entrenamiento('1', '50', '60', '15:2'),
      1, 50, 60,  datetime.strptime('15:2', '%M:%S')),
     (Entrenamiento('2', '60', '70', '10:10'),
      2, 60, 70,  datetime.strptime('10:10', '%M:%S')),
     (Entrenamiento('3', '65', '80', '02:02'),
      3, 65, 80,  datetime.strptime('02:02', '%M:%S')),
     (Entrenamiento('4', '70', '90', '4:4'),
      4, 70, 90,  datetime.strptime('4:4', '%M:%S')),
     (Entrenamiento('6', '75', '100', '1:0'),
      6, 75, 100, datetime.strptime('1:0', '%M:%S')),
     (Entrenamiento('8', '85', '115', '20'),
      8, 85, 115, datetime.strptime('20', '%S')),
     (Entrenamiento('9', '90', '120', '08'),
      9, 90, 120, datetime.strptime('08', '%S'))]
)
def test_entrenamiento(test_input, ex_trn, ex_hrth, ex_cad, ex_tot_tm):
    '''Test Entrenamiento Class'''
    assert test_input.training == ex_trn
    assert test_input.hearth_rate == ex_hrth
    assert test_input.cadence == ex_cad
    assert test_input.tot_time == ex_tot_tm


@pytest.mark.parametrize(
    'trn, hrth, cad, tot_tm',
    [('0',  '50', '60',  '0:0'),
     ('10', '50', '60',  '0:0'),
     ('1',  '49', '60',  '0:0'),
     ('9',  '91', '60',  '0:0'),
     ('1',  '50', '59',  '0:0'),
     ('9',  '50', '121', '0:0'), ]
)
def test_entrenamiento_range_fail(trn, hrth, cad, tot_tm):
    '''Test Entrenamiento range class failures'''
    with pytest.raises(RangeError):
        Entrenamiento(trn, hrth, cad, tot_tm)


@pytest.mark.parametrize(
    'trn, hrth, cad, tot_tm',
    [('a',  '50', '60',  '0:0'),
     ('1',  'a',  '60',  '0:0'),
     ('1',  '50', 'a',   '0:0'),
     ('1',  '50', '60',  '0:-1'),
     ('1',  '50', '60',  '0:60'),
     ('9',  '50', '60',  '-1:0'),
     ('9',  '50', '60',  '60:0'),
     ('1',  '50', '60',  'a')]
)
def test_entrenamiento_data_fail(trn, hrth, cad, tot_tm):
    '''Test Entrenamiento data type class failures'''
    with pytest.raises(DataError):
        Entrenamiento(trn, hrth, cad, tot_tm)


@pytest.mark.parametrize(
    'test_input, ex_trn, ex_hrth, ex_cad, ex_tot_tm, ex_cad_up, ex_tm_dwn, ex_tm_up',
    [(Saltos('5', '50', '60', '10:00', '60', '5', '45'),
      5, 50, 60,  datetime.strptime('10:00', '%M:%S'),
      60, datetime.strptime('05', '%S'), datetime.strptime('45', '%S')),
     (Saltos('7', '50', '60', '10:00', '120', '1:05', '1:45'),
      7, 50, 60,  datetime.strptime('10:00', '%M:%S'),
      120, datetime.strptime('1:05', '%M:%S'), datetime.strptime('1:45', '%M:%S')),
     ]
)
def test_saltos(test_input, ex_trn, ex_hrth, ex_cad, ex_tot_tm, ex_cad_up, ex_tm_dwn, ex_tm_up):
    '''Test Saltos Class'''
    assert test_input.training == ex_trn
    assert test_input.hearth_rate == ex_hrth
    assert test_input.cadence == ex_cad
    assert test_input.tot_time == ex_tot_tm
    assert test_input.cadence_up == ex_cad_up
    assert test_input.time_dwn == ex_tm_dwn
    assert test_input.time_up == ex_tm_up


@pytest.mark.parametrize(
    'trn, hrth, cad, tot_tm, cad_up, tm_dwn, tm_up',
    [('5',  '50', '60',  '0:0', '59', '0:0', '0:0'),
     ('5',  '50', '60',  '0:0', '121', '0:0', '0:0'),
     ]
)
def test_saltos_zero_tmp_downup_fail(trn, hrth, cad, tot_tm, cad_up, tm_dwn, tm_up):
    '''Test Saltos Class Failures'''
    with pytest.raises(DataError):
        Saltos(trn, hrth, cad, tot_tm, cad_up, tm_dwn, tm_up)


@pytest.mark.parametrize(
    'trn, hrth, cad, tot_tm, cad_up, tm_dwn, tm_up',
    [('5',  '50', '60',  '0:0', '60', '61:0', '0:0'),
     ('5',  '50', '60',  '0:0', '60', '0:61', '0:0'),
     ('5',  '50', '60',  '0:0', '60', '0:0', '61:0'),
     ('5',  '50', '60',  '0:0', '60', '0:0', '0:61'),
     ]
)
def test_saltos_data_fail(trn, hrth, cad, tot_tm, cad_up, tm_dwn, tm_up):
    '''Test Saltos Class Failures'''
    with pytest.raises(DataError):
        Saltos(trn, hrth, cad, tot_tm, cad_up, tm_dwn, tm_up)


@pytest.mark.parametrize('test_input, ex_trn_lst, ex_tot_cls_tm, ex_rep',
                         [(CicloDeEntrenamiento(), list(), timedelta(), 1)])
def test_ciclo_de_entrenamiento(test_input, ex_trn_lst, ex_tot_cls_tm, ex_rep):
    '''Test CicloDeEntrenamiento Class constructor'''
    assert test_input.training_list == ex_trn_lst
    assert test_input.tot_class_time == ex_tot_cls_tm
    assert test_input.repetitions == ex_rep


@pytest.mark.parametrize('test_input, ex_tot_tm',
                         [([Entrenamiento('1', '50', '60', '1:2'),
                            Entrenamiento('1', '50', '60', '2:4')],
                           timedelta(minutes=3, seconds=6)),
                          ([Entrenamiento('1', '50', '60', '2'),
                            Entrenamiento('2', '60', '70', '2:0'),
                            Entrenamiento('3', '70', '80', '1:40'),
                            Entrenamiento('4', '80', '90', '0:4')],
                           timedelta(minutes=3, seconds=46)),
                          ([Saltos('5', '50', '60', '10:00', '60', '5', '45'),
                            Entrenamiento('1', '50', '60', '5:45')],
                           timedelta(minutes=15, seconds=45)),
                          ([Saltos('5', '50', '60', '10:00', '60', '5', '45'),
                            Saltos('5', '50', '60', '5:00', '60', '5', '45')],
                           timedelta(minutes=15, seconds=0)),
                          ])
def test_ciclo_de_entrenamiento_add_training(test_input, ex_tot_tm):
    '''Test CicloDeEntrenamiento Class add_training method'''
    entrenamiento = CicloDeEntrenamiento()
    for trng in test_input:
        entrenamiento.add_training(trng)
    assert entrenamiento.tot_class_time == ex_tot_tm


@pytest.mark.parametrize('test_input',
                         [5, 'a', '30'])
def test_ciclo_de_entrenamiento_add_training_fail(test_input):
    '''Test CicloDeEntrenamiento Class add_training method failure'''
    entrenamiento = CicloDeEntrenamiento()
    with pytest.raises(DataError):
        entrenamiento.add_training(test_input)


@pytest.mark.parametrize('test_input, rmv_data, ex_tot_tm',
                         [([Entrenamiento('1', '50', '60', '1:2'),
                            Entrenamiento('1', '50', '60', '2:4'),
                            Entrenamiento('1', '50', '60', '8:5')],
                           1, timedelta(minutes=10, seconds=9)),
                          ([Entrenamiento('1', '50', '60', '2'),
                            Entrenamiento('2', '60', '70', '2:0'),
                            Entrenamiento('3', '70', '80', '1:40'),
                            Entrenamiento('4', '80', '90', '0:4')],
                           4, timedelta(minutes=3, seconds=42)),
                          ([Saltos('5', '50', '60', '10:00', '60', '5', '45'),
                            Entrenamiento('1', '50', '60', '5:45'),
                            Entrenamiento('1', '50', '60', '2:25')],
                           3, timedelta(minutes=15, seconds=45)),
                          ([Saltos('5', '50', '60', '10:00', '60', '5', '45'),
                            Saltos('5', '50', '60', '5:00', '60', '5', '45'),
                            Saltos('5', '50', '60', '7:00', '60', '30', '30')],
                           2, timedelta(minutes=17, seconds=0)),
                          ])
def test_ciclo_de_entrenamiento_remove_training(test_input, rmv_data, ex_tot_tm):
    '''Test CicloDeEntrenamiento Class remove_training method'''
    entrenamiento = CicloDeEntrenamiento()
    for trng in test_input:
        entrenamiento.add_training(trng)
    entrenamiento.remove_training(rmv_data)
    assert entrenamiento.tot_class_time == ex_tot_tm


@pytest.mark.parametrize('test_input, rmv_data',
                         [([Entrenamiento('1', '50', '60', '1:2'),
                            Entrenamiento('1', '50', '60', '2:4'),
                            Entrenamiento('1', '50', '60', '8:5')],
                           0),
                          ([Entrenamiento('1', '50', '60', '2'),
                            Entrenamiento('2', '60', '70', '2:0'),
                            Entrenamiento('3', '70', '80', '1:40'),
                            Entrenamiento('4', '80', '90', '0:4')],
                           5),
                          ([Saltos('5', '50', '60', '10:00', '60', '5', '45'),
                            Entrenamiento('1', '50', '60', '5:45'),
                            Entrenamiento('1', '50', '60', '2:25')],
                           4),
                          ([Saltos('5', '50', '60', '10:00', '60', '5', '45'),
                            Saltos('5', '50', '60', '5:00', '60', '5', '45'),
                            Saltos('5', '50', '60', '7:00', '60', '30', '30')],
                           -1),
                          ])
def test_ciclo_de_entrenamiento_remove_training_fail(test_input, rmv_data):
    '''Test CicloDeEntrenamiento Class remove_training method failure'''
    entrenamiento = CicloDeEntrenamiento()
    for trng in test_input:
        entrenamiento.add_training(trng)
    with pytest.raises(RangeError):
        entrenamiento.remove_training(rmv_data)

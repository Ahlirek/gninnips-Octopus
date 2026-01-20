'''Run helper functions'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501

from src.classes import Entrenamiento, Saltos, CicloDeEntrenamiento
from src.errors import CommandError, NoDataError, NumDataError, NoValidTimeError


def print_training(training, nest=0):
    '''Print training to the console'''
    space = ''
    if nest > 0:
        space = '   ' * nest

    for num, trng in enumerate(training, start=1):
        if isinstance(trng, Entrenamiento):
            print(f'{space}{num}: {trng}')
        elif isinstance(trng, CicloDeEntrenamiento):
            print(f'{space}{num}:')
            print_training(trng, nest + 1)
    print(f'{space}Tiempo Total: {training.get_time()}')
    print(f'{space}Distancia Total: {training.get_distance()}')
    print(f'Repeticiones: {training.get_reps()}')

def split_jump_data(data):
    '''Splits Saltos Data preparing it for Saltos Class'''
    tmp_trnng = data[0]
    tmp_hrth_rate = data[1]
    tmp_cad_dwn, tmp_cad_up = data[2].split('/')
    tmp_tot_tme = data[3]
    tmp_tme_dwn, tmp_tme_up = data[4].split('/')
    return tmp_trnng, tmp_hrth_rate, tmp_cad_dwn, tmp_tot_tme, tmp_cad_up, tmp_tme_dwn, tmp_tme_up


def create_trnng_obj(data, default_time_or_dist = None):
    '''Creates the indicated training object'''
    if data[0] in ('5', '7'):
        try:
            tmp_train = Saltos(*split_jump_data(data))
        except (ValueError, IndexError) as error:
            raise NumDataError from error
        except ArithmeticError as error:
            raise NoValidTimeError from error
    else:
        try:
            tmp_train = Entrenamiento(*data, default_time_or_dist)
        except TypeError as error:
            raise NumDataError from error
    return tmp_train


def split_data(data):
    '''splits data by space and return command or data for training'''
    splt_data = data.split()
    try:
        comm = splt_data[0]
    except IndexError as error:
        raise NoDataError from error

    if len(splt_data) == 1 and comm.isalpha() and len(comm) == 1:
        comm = comm.lower()
        if comm in ['s', 'i', 'f', 'e', 'c', 'w', 'd', 't', 'h', 'g', 'r', 'a']:
            return comm
        raise CommandError
    elif len(splt_data) in (1, 2, 3) and comm.isdigit() and len(comm) == 2:
        result = set_caritas_default_values(comm, splt_data)
        if result is not None:
            return result
        raise CommandError
    elif len(splt_data) in (4, 5, 6):
        return splt_data
    raise NumDataError

def set_caritas_default_values(comm, splt_data):
    '''Set default values for caritas trainings'''
    if comm == '10' and len(splt_data) == 1:
        return [comm, '50', '60', '60']
    elif comm == '11' and len(splt_data) == 2:
        return [comm, '50', '60', splt_data[1]]
    elif comm == '12' and len(splt_data) == 3:
        return [comm, splt_data[1], '60', splt_data[2]]
    return None

def split_data_simple(data):
    '''Splits data by space and return data for training'''
    splt_data = data.split()
    if len(splt_data) in (4, 5):
        return splt_data
    raise NumDataError

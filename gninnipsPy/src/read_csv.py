'''Generate and read csv files'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501
import os
import sys
import csv
from datetime import date
from datetime import datetime
from contextlib import suppress
from src.classes import CicloDeEntrenamiento
from src.run_functions import print_training, create_trnng_obj, set_caritas_default_values
from src.errors import ExitPrincipalCycle
from src.templates import LOADED_TRAINING_MSG, NO_REPS_DEFINED_ERROR_MSG, FILE_DATE_MISSING_ERROR_MSG, \
NEW_DATE_MSG, NEW_TITLE_MSG, READING_LINE

def generate_csv_file(training, fecha, titulo=''):
    '''Generate CSV file'''
    file_date = fecha.strftime("%d-%m-%Y")
    fecha_csv = fecha.strftime("%d/%m/%Y")
    print('Archivo guardado en:')
    with open(save_path(f'{file_date}.csv'), 'w', encoding='utf-8') as file:
        writer = csv.writer(file)
        headers = ['Comando', '% 100', 'Cadencia 000/000',
                   'Tiempo Total 00:00', 'Tiempo Saltos 00/00', 'Distancia/Tiempo']
        writer.writerows([['T', titulo], ['H', fecha_csv], headers])
        trnng_track = training.get_cmnd_track()
        trnng_track.remove(['I'])
        trnng_track = trnng_track[::-1]
        trnng_track.remove(['F', 1])
        trnng_track = trnng_track[::-1]
        writer.writerows(trnng_track)

def read_csv_file():
    '''Reads csv file and converts into training'''
    file_name = input('Ingrese el nombre del archivo a leer: ') + '.csv'
    print('Leyendo archivo en: ')
    file_path = save_path(file_name)
    titulo = ''
    fecha = date.today()
    history_lst = list()
    with open(file_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        history_lst.append(CicloDeEntrenamiento())
        current_elem = len(history_lst) - 1
        for line in csv_reader:
            for lst in history_lst:
                lst.calc_time_and_distance()
            line = list(filter(lambda x: x != "" and x != "-", line))
            print(READING_LINE.format(line=line))
            try:
                command = line[0].upper()
            except TypeError:
                command = line[0]
            except IndexError:
                continue
            if command == 'I':
                new_train_cicle = CicloDeEntrenamiento()
                history_lst.append(new_train_cicle)
                history_lst[current_elem].add_training(new_train_cicle)
                current_elem = len(history_lst) - 1
            elif command == 'F':
                if current_elem == 0:
                    raise ExitPrincipalCycle
                try:
                    history_lst[current_elem].reps(line[1])
                except IndexError:
                    print(NO_REPS_DEFINED_ERROR_MSG)
                    history_lst[current_elem].reps(1)
                history_lst.pop()
                current_elem = len(history_lst) - 1
            elif command.isdecimal():
                line, default_unit = extract_time_or_miles_unit(line)
                if len(line) in (1, 2, 3) and command.isdigit() and len(command) == 2:
                    line = set_caritas_default_values(command, line)
                tmp_train = create_trnng_obj(line, default_unit)
                history_lst[current_elem].add_training(tmp_train)
            elif command == 'H':
                print(fecha)
                try:
                    fecha = line[1]
                except IndexError:
                    fecha = date.today()
                    print(FILE_DATE_MISSING_ERROR_MSG.format(
                        fecha=fecha.strftime("%d/%m/%Y")))
                else:
                    fecha = datetime.strptime(fecha, '%d/%m/%Y')
                    print(NEW_DATE_MSG.format(fecha=fecha.strftime("%d/%m/%Y")))
            elif command == 'T':
                with suppress(IndexError):
                    titulo = line[1]
                    print(NEW_TITLE_MSG.format(titulo=titulo))
    print(LOADED_TRAINING_MSG)
    print_training(history_lst[current_elem])
    return titulo, fecha, history_lst[0]


def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        # pylint: disable=protected-access
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)


def save_path(relative_path):
    '''Get absolute path to save file for PyInstaller'''
    try:
        # PyInstaller add frozen to sys
        # pylint: disable=pointless-statement
        sys.frozen
        base_path = os.path.dirname(sys.executable)
    except AttributeError:
        base_path = os.path.abspath(".")
    print(os.path.join(base_path, relative_path))
    return os.path.join(base_path, relative_path)

def extract_time_or_miles_unit(line):
    '''Extract unit if specified'''
    last_command = line[-1].lower()
    if last_command == 'd' or last_command == 't':
        line.pop()
        return line, last_command
    else:
        return line, None

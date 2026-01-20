'''Run Module'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501

from datetime import date
from datetime import datetime
from src.classes import CicloDeEntrenamiento
from src.errors import DataError, InputDataError, RangeError, ExitPrincipalCycle
from src.run_functions import print_training, split_data, create_trnng_obj
from src.create_image import generate_image
from src.read_csv import read_csv_file, generate_csv_file
from src.templates import COMMAND_MESSAGE, BASE_QUESTION, EDIT_QUESTION, FILE_NOT_FOUND_MESSAGE, \
                            EDIT_MESSAGE, INSERT_MESSAGE, TITLE_TRAINING_MSG, DATE_FORMAT_INVALID_MSG, \
                            NEW_TITLE_MSG, NEW_DATE_MSG, FORMAT


def run():
    '''Run main program'''
    titulo = ''
    fecha = date.today()
    history_lst = list()
    history_lst.append(CicloDeEntrenamiento())
    current_elem = len(history_lst) - 1
    while True:
        for lst in history_lst:
            lst.calc_time_and_distance()
        print(TITLE_TRAINING_MSG)
        print_training(history_lst[0])
        print(COMMAND_MESSAGE)
        inpt_data = input(BASE_QUESTION)
        print()
        try:
            splt_data = split_data(inpt_data)
        except InputDataError as error:
            print(error)
            continue
        if splt_data == 's':
            print("Saliendo...")
            break
        elif splt_data == 'i':
            print('Iniciando nuevo ciclo.')
            new_train_cicle = CicloDeEntrenamiento()
            history_lst.append(new_train_cicle)
            history_lst[current_elem].add_training(new_train_cicle)
            current_elem = len(history_lst) - 1
            continue
        elif splt_data == 'f':
            if current_elem == 0:
                print('No es posible salir del ciclo principal.\nIntente otra opción')
                continue
            try:
                reps = input('Indique el número de repeticiones: ')
                history_lst[current_elem].reps(reps)
            except RangeError as error:
                print(error)
                continue
            except DataError as error:
                print(error)
                continue
            print('Saliendo del ciclo.')
            history_lst.pop()
            current_elem = len(history_lst) - 1
            continue
        elif splt_data == 'e':
            if len(history_lst[current_elem]) == 0:
                print('El ciclo no tiene elementos.\nIntente otra opción.')
                continue
            try:
                sel = input('Seleccione un elemento a editar: ')
                sel = int(sel) - 1
                if sel < 0 or sel >= len(history_lst[current_elem]):
                    raise RangeError(1, len(history_lst[current_elem]))
            except RangeError as error:
                print(error)
                continue
            except ValueError as error:
                try:
                    raise DataError(sel) from error
                except DataError as error_2:
                    print(error_2)
                    continue

            temp_train = history_lst[current_elem].check_if_cycle(sel)
            if temp_train:
                print('Editando ciclo de entrenamiento.')
                history_lst.append(temp_train)
                current_elem = len(history_lst) - 1
            else:
                print(EDIT_MESSAGE.format(num=sel + 1, format=FORMAT))
                inpt_data = input(EDIT_QUESTION)
                try:
                    splt_data = split_data(inpt_data)
                except InputDataError as error:
                    print(error)
                    continue
                try:
                    tmp_train = create_trnng_obj(splt_data)
                except InputDataError as error:
                    print(error)
                    continue
                history_lst[current_elem].edit_training(tmp_train, sel)
            continue
        elif splt_data == 'w':
            if len(history_lst[current_elem]) == 0:
                print('El ciclo no tiene elementos.\nIntente otra opción.')
                continue
            try:
                sel = input('Ingrese posición en la que desea insertar el entrenamiento: ')
                sel = int(sel) - 1
                if sel < 0 or sel >= len(history_lst[current_elem]):
                    raise RangeError(1, len(history_lst[current_elem]))
            except RangeError as error:
                print(error)
                continue
            except ValueError as error:
                try:
                    raise DataError(sel) from error
                except DataError as error_2:
                    print(error_2)
                    continue

            print(INSERT_MESSAGE.format(num=sel + 1, format=FORMAT))
            inpt_data = input(EDIT_QUESTION)
            try:
                splt_data = split_data(inpt_data)
            except InputDataError as error:
                print(error)
                continue
            try:
                tmp_train = create_trnng_obj(splt_data)
            except InputDataError as error:
                print(error)
                continue
            history_lst[current_elem].insert_training(tmp_train, sel)
            print(f'Elemento "{tmp_train}" agregado en la posición "{sel + 1}".')
            continue

        elif splt_data == 't':
            titulo = input('Por favor ingrese el titulo del entrenamiento: ')
            print(NEW_TITLE_MSG.format(titulo=titulo))
        elif splt_data == 'c':
            try:
                sel1 = int(input('Ingrese elemento a cambiar de lugar: ')) - 1
                if sel1 < 0 or sel1 >= len(history_lst[current_elem]):
                    raise RangeError(1, len(history_lst[current_elem]))
            except RangeError as error:
                print(error)
                continue
            try:
                sel2 = int(
                    input('¿Por cuál elemento desea intercambiarlo?: ')) - 1
                if sel2 < 0 or sel2 >= len(history_lst[current_elem]):
                    raise RangeError(1, len(history_lst[current_elem]))
            except RangeError as error:
                print(error)
                continue
            history_lst[current_elem].change_training(sel1, sel2)
            print(f'Elementos {sel1+1} y {sel2+1} intercambiados.')
            continue
        elif splt_data == 'd':
            if not history_lst[current_elem]:
                print('No hay elementos que eliminar en este ciclo.')
                continue
            try:
                sel = int(input('Ingrese elemento a eliminar: '))
                deleted = history_lst[current_elem].remove_training(sel)
            except RangeError as error:
                print(error)
                continue
            except ValueError as error:
                try:
                    raise DataError(sel) from error
                except DataError as error_2:
                    print(error_2)
                    continue
            print(f'Elemento "{sel}: {deleted}" eliminado.')
            continue
        elif splt_data == 'h':
            fecha_temp = input(
                'Por favor ingrese la fecha del entrenamiento (dd/mm/aaaa): ')
            try:
                fecha = datetime.strptime(fecha_temp, '%d/%m/%Y')
                print(NEW_DATE_MSG.format(fecha=fecha.strftime("%d/%m/%Y")))
            except ValueError:
                print(DATE_FORMAT_INVALID_MSG)
            continue
        elif splt_data == 'g':
            generate_image(history_lst[0], fecha, titulo)
            generate_csv_file(history_lst[0], fecha, titulo)
            continue
        elif splt_data == 'r':
            try:
                titulo, fecha, recovered_trnng = read_csv_file()
            except FileNotFoundError:
                print(FILE_NOT_FOUND_MESSAGE)
            except InputDataError as error:
                print(error)
            except ExitPrincipalCycle as error:
                print(error)
            else:
                history_lst[0] += recovered_trnng
            continue
        elif splt_data == 'a':
            verify = input(
                '¿Esta seguro que desea eliminar todo el entrenamiento? (Y/n): ')
            if verify == 'Y':
                print('Eliminando todo el entrenamiento.\n')
                history_lst = list()
                history_lst.append(CicloDeEntrenamiento())
                current_elem = len(history_lst) - 1
                print('Entrenamiento eliminado exitosamente.\n')
            elif verify == 'n':
                print('Eliminación de entrenamiento cancelada.')
            else:
                print('Comando no reconocido.\nPor favor intentelo de nuevo.')
            continue
        try:
            tmp_train = create_trnng_obj(splt_data)
        except InputDataError as error:
            print(error)
            continue

        history_lst[current_elem].add_training(tmp_train)

'''Tempates Module'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501

FORMAT = '''
Formato de comandos:

Comando:
<Letra_del_comando >

Entrenamiento:
<  # Entrenamiento> <% 100> <Cadencia 000> <Tiempo 00:00 | Distancia>

Saltos:
<  # Entrenamiento> <% 100> <Cadencia 000/000> <Tiempo | Distancia Total 00:00> <Tiempo | Distancia Saltos 00/00>

Caritas:
<  11 <Tiempo 00:00 | Distancia>
<  12 <% 100> <Tiempo 00:00 | Distancia>'''

COMMAND_MESSAGE = f'''
Comandos:

1 -> Terreno Plano Sentado
2 -> Terreno Plano de Pie
3 -> Escalada Sentado
4 -> Carrera con resistencia
5 -> Saltos
6 -> Escalada de Pie
7 -> Saltos en Colina
8 -> Sprint Sentado
9 -> Sprint en Colina
10 -> Carita :)
11 -> Carita :) con tiempo | distancia
12 -> Carita :) con tiempo | distancia y HR%
13 -> Carita :) con tiempo | distancia, HR% y cadencia
I -> Iniciar Ciclo
F -> Finalizar Ciclo
E -> Editar Entrenamiento
C -> Cambiar orden
W -> Inertar Elemento en posición X
D -> Eliminar entrenamiento
A -> Eliminar todo el entrenamiento
T -> Cambiar Titulo
H -> Cambiar Fecha
G -> Generar imagen y archivo
R -> Leer archivo
S -> Salir
{FORMAT}
'''

BASE_QUESTION = '''
Ingrese el entrenamiento o comando deseado: '''

EDIT_QUESTION = '''
Ingrese el entrenamiento sustituto: '''

FILE_NOT_FOUND_MESSAGE = '''
Archivo no encontrado.
Por favor revise el nombre del archivo e intentelo de nuevo.'''


EDIT_MESSAGE = '''
Editando entrenamiento {num}.
{format}
'''

INSERT_MESSAGE = '''
INSERTANDO entrenamiento {num}.
{format}
'''

TITLE_TRAINING_MSG = f'''
{'#'*40}
Entrenamiento:
'''

LOADED_TRAINING_MSG = '''
Entrenamiento leido exitosamente:
'''

FILE_DATE_ERROR_MSG = '''
Fecha no ingresada en el formato correcto.\n\
Se definira la fecha de hoy "{fecha}".
'''

FILE_DATE_MISSING_ERROR_MSG = '''
Fecha no ingresada.\n\
Se definira la fecha de hoy "{fecha}".
'''

DATE_FORMAT_INVALID_MSG = '''
No se ingreso una fecha en el formato indicado (dd/mm/aaaa).
Por favor intentelo de nuevo.'''

NEW_TITLE_MSG = '''
El nuevo titulo es:\n{titulo}'''

NEW_DATE_MSG = '''
La fecha del entrenamiento es:\n{fecha}'''

NO_REPS_DEFINED_ERROR_MSG = '''
No se definio el número de repeticiones del ciclo.
De manera predeterminada se definio una repetición.'''

DIST_OR_TIME = '''
D -> DISTANCIA (MILLAS || KM)
T -> TIEMPO
SELECCIONE LA LETRA QUE INDIQUE LA UNIDAD CORRECTA: '''

READING_LINE = '''
LEYENDO LINEA -> {line}'''

'''Module clases'''
# pylint: disable=line-too-long, import-error
# flake8: noqa: E501
from datetime import datetime, timedelta
from src.descriptors import MinMaxRange, IsTime
from src.errors import CommandError, DataError, RangeError
from src.templates import DIST_OR_TIME
# 7 90 100/110 10:0 30/1:30 revisar, no agarra los minutos

class Entrenamiento():
    '''Class Entrenamiento'''

    training = MinMaxRange(1, 13)
    hearth_rate = MinMaxRange(50, 90)
    cadence = MinMaxRange(60, 120)
    tot_time = IsTime()
    tot_distance = MinMaxRange(0,9999)
    is_dist = False

    def __init__(self, training, hearth_rate, cadence, tot_time_or_dist, default_time_or_dist = None):
        self.training = training
        self.hearth_rate = hearth_rate
        self.cadence = cadence
        self.select_dist_or_time(tot_time_or_dist, default_time_or_dist)

    def select_dist_or_time(self, tot_time_or_dist, default_time_or_dist):
        '''Define if dist or time'''
        try:
            if ':' in tot_time_or_dist:
                self.save_time(tot_time_or_dist)
            elif int(tot_time_or_dist) >= 60:
                self.save_dst(tot_time_or_dist)
            else:
                if default_time_or_dist is None:
                    dist_or_time = input(DIST_OR_TIME).lower()
                else:
                    dist_or_time = default_time_or_dist
                print()
                if dist_or_time == 'd':
                    self.save_dst(tot_time_or_dist)
                elif dist_or_time == 't':
                    self.save_time(tot_time_or_dist)
                else:
                    raise CommandError
        except (TypeError, ValueError) as error:
            raise DataError(tot_time_or_dist) from error

    def save_dst(self, tot_time_or_dist):
        '''save dist in object'''
        self.tot_distance = tot_time_or_dist
        self.is_dist = True
        self.tot_time = '0'

    def save_time(self, tot_time_or_dist):
        '''save time in object'''
        self.tot_time = tot_time_or_dist
        self.tot_distance = 0

    def get_training(self):
        '''Get training attribute'''
        return self.training

    def get_hearth_rate(self):
        '''Get hearth_rate attribute'''
        return str(self.hearth_rate)

    def get_cadence_str(self):
        '''Get cadence attribute'''
        return str(self.cadence)

    def get_distance_str(self):
        '''Get dist attribute'''
        return f'{self.tot_distance} M'

    def get_tot_time_str(self):
        '''Get tot_time in string'''
        if self.tot_time.minute == 0:
            try:
                return self.tot_time.strftime('%-S"')
            except ValueError:
                return self.tot_time.strftime('%#S"')
        elif self.tot_time.second == 0:
            try:
                return self.tot_time.strftime('%-M\'')
            except ValueError:
                return self.tot_time.strftime('%#M\'')
        else:
            try:
                return self.tot_time.strftime('%-M\'%-S"')
            except ValueError:
                return self.tot_time.strftime('%#M\'%#S"')

    def get_time_or_distance_str(self):
        '''Select which unit to return'''
        if self.is_dist:
            return self.get_distance_str()
        else:
            return self.get_tot_time_str()

    def __eq__(self, other_obj):
        return (self.training == other_obj.training and
                self.hearth_rate == other_obj.hearth_rate and
                self.cadence == other_obj.cadence and
                self.tot_time == other_obj.tot_time and
                self.tot_distance == other_obj.tot_distance)

    def __str__(self):
        # Al imprimir la instancia en el descriptor provoca un error de atributo por aun no estar definidos todos los valores.
        try:
            training_str = f'T: {self.training}'
            happy_face_str = ', :D'
            hr_str = f', {self.hearth_rate}%'
            cadence_str = f', {self.cadence}rpm'
            mac_date_str_format = "%-M:%-S"
            date_joiner = ','
            return self.create_str(self, training_str,  happy_face_str, hr_str, cadence_str, mac_date_str_format, date_joiner)
        except AttributeError:
            return object.__str__(self)
        except ValueError:
            windows_date_str_format = "%#M:%#S"
            return self.create_str(self, training_str,  happy_face_str, hr_str, cadence_str, windows_date_str_format, date_joiner)

    def __repr__(self):
        try:
            training_str = str(self.training)
            happy_face_str = ' -'
            hr_str = f' {self.hearth_rate}'
            cadence_str = f' {self.cadence}'
            mac_date_str_format = "%-M:%-S"
            result =  self.create_str(self, training_str,  happy_face_str, hr_str, cadence_str, mac_date_str_format)
            return self.add_date_time_csv_unit(self.is_dist, result)
        except AttributeError:
            return object.__repr__(self)
        except ValueError:
            windows_date_str_format = "%#M:%#S"
            result = self.create_str(self, training_str,  happy_face_str, hr_str, cadence_str, windows_date_str_format)
            return self.add_date_time_csv_unit(self.is_dist, result)

    @staticmethod
    def create_str(obj, training_str,  happy_face_str, hr_str, cadence_str, os_date_format, date_joiner = ''):
        '''Create str with specific OS date format'''
        if obj.is_dist:
            dst_or_time_str = f'{date_joiner} {obj.tot_distance}'
        else:
            dst_or_time_str = f'{date_joiner} {datetime.strftime(obj.tot_time, os_date_format)}'
        result = obj.join_str(obj.training, happy_face_str, training_str, hr_str, cadence_str, dst_or_time_str)
        return result

    @staticmethod
    def add_date_time_csv_unit(is_dist, result):
        '''Add unit specifier needed for CSV'''
        if is_dist:
            result += ' -  D'
        else:
            result += ' -  T'
        return result

    @staticmethod
    def join_str(training, happy_face_str, training_str, hr_str, cadence_str, dst_or_time_str):
        '''Create string depending on trainings'''
        if training == 10:
            training_str += happy_face_str + happy_face_str + happy_face_str
        elif training == 11:
            training_str += happy_face_str + happy_face_str + dst_or_time_str
        elif training == 12:
            training_str += hr_str + happy_face_str + dst_or_time_str
        else:
            training_str += hr_str + cadence_str + dst_or_time_str
        return training_str

class Saltos(Entrenamiento):
    '''Saltos Class'''
    cadence_up = MinMaxRange(60, 120)
    time_dwn = IsTime()
    time_up = IsTime()
    dst_dwn = MinMaxRange(0,9999)
    dst_up = MinMaxRange(0,9999)

    def __init__(self, training, hearth_rate, cadence, tot_time_or_dist, cadence_up, time_or_dst_dwn, time_or_dst_up):
        super().__init__(training, hearth_rate, cadence, tot_time_or_dist)
        self.cadence_up = cadence_up
        if self.check_coherent_time(tot_time_or_dist, time_or_dst_dwn, time_or_dst_up):
            raise ArithmeticError
        self.set_time_or_distance(time_or_dst_dwn, time_or_dst_up)

    def set_time_or_distance(self, time_or_dst_dwn, time_or_dst_up):
        '''Set Jumps distance or time'''
        if self.is_dist:
            self.save_jump_dst(time_or_dst_dwn, time_or_dst_up)
        else:
            self.save_jump_time(time_or_dst_dwn, time_or_dst_up)

    def save_jump_dst(self, time_or_dst_dwn, time_or_dst_up):
        '''save jump dist in object'''
        self.dst_dwn = time_or_dst_dwn
        self.dst_up = time_or_dst_up
        self.time_dwn = '0'
        self.time_up = '0'

    def save_jump_time(self, time_or_dst_dwn, time_or_dst_up):
        '''save jump time in object'''
        self.time_dwn = time_or_dst_dwn
        self.time_up = time_or_dst_up
        self.dst_dwn = 0
        self.dst_up = 0

    def get_cadence_str(self):
        '''Get cadence intervals string'''
        return f'{self.cadence}/{self.cadence_up}'

    def get_num_jump(self):
        '''Get number of jumps'''
        if self.is_dist:
            num_jumps = self.tot_distance / (self.dst_dwn + self.dst_up)
        else:
            tot_time_delta = timedelta(
                minutes=self.tot_time.minute, seconds=self.tot_time.second)
            num_jumps = tot_time_delta / (timedelta(seconds=self.time_dwn.second) +
timedelta(seconds=self.time_up.second))
        return f'{int(num_jumps)}'

    def get_jump_time_str(self):
        '''Return time intervals in string'''
        try:
            return f'{self.time_dwn.strftime("%-S")}"/{self.time_up.strftime("%-S")}"'
        except ValueError:
            return f'{self.time_dwn.strftime("%#S")}"/{self.time_up.strftime("%#S")}"'

    def get_jump_time_or_dst_str(self):
        '''Select which unit to return'''
        if self.is_dist:
            return self.get_jump_dst_str()
        else:
            return self.get_jump_time_str()

    def get_jump_dst_str(self):
        '''Get jump distance string'''
        return f'{self.dst_dwn}/{self.dst_up} M'

    def check_coherent_time(self, tot_time_or_dist, time_or_dst_dwn, time_or_dst_up):
        '''Check if total time is divisible between time down plus time up'''
        if self.is_dist:
            dlt_tot = int(tot_time_or_dist)
            dlt_dwn = int(time_or_dst_dwn)
            dlt_up = int(time_or_dst_up)
        else:
            tm_tot = self.convert_to_time(tot_time_or_dist)
            tm_dwn = self.convert_to_time(time_or_dst_dwn)
            tm_up = self.convert_to_time(time_or_dst_up)
            dlt_tot = timedelta(minutes=tm_tot.minute, seconds=tm_tot.second)
            dlt_dwn = timedelta(minutes=tm_dwn.minute, seconds=tm_dwn.second)
            dlt_up = timedelta(minutes=tm_up.minute, seconds=tm_up.second)
        return not (dlt_tot / (dlt_dwn + dlt_up)).is_integer()

    def convert_to_time(self, time):
        '''Convert strings to time'''
        try:
            return datetime.strptime(time, '%M:%S')
        except ValueError:
            try:
                return datetime.strptime(time, '%S')
            except ValueError as error:
                raise DataError(time) from error

    def __eq__(self, other_obj):
        return (self.training == other_obj.training and
                self.hearth_rate == other_obj.hearth_rate and
                self.cadence == other_obj.cadence and
                self.tot_time == other_obj.tot_time and
                self.cadence_up == other_obj.cadence_up and
                self.time_dwn == other_obj.time_dwn and
                self.time_up == other_obj.time_up and
                self.dst_dwn == other_obj.dst_dwn and
                self.dst_up == other_obj.dst_up)

    def __str__(self):
        # Al imprimir la instancia en el descriptor provoca un error de atributo por aun no estar definidos todos los valores.
        try:
            if self.is_dist:
                return f'T: {self.training}, {self.hearth_rate}%, {self.cadence}/{self.cadence_up}rpm, \
{self.tot_distance}, {self.dst_dwn}/{self.dst_up}'
            else:
                return f'T: {self.training}, {self.hearth_rate}%, {self.cadence}/{self.cadence_up}rpm, \
{datetime.strftime(self.tot_time, "%-M:%-S")}, \
{datetime.strftime(self.time_dwn, "%-S")}/\
{datetime.strftime(self.time_up, "%-S")}'
        except AttributeError:
            return object.__str__(self)
        except ValueError:
            if self.is_dist:
                return f'T: {self.training}, {self.hearth_rate}%, {self.cadence}/{self.cadence_up}rpm, \
{self.tot_distance}, {self.dst_dwn}/{self.dst_up}'
            else:
                return f'T: {self.training}, {self.hearth_rate}%, {self.cadence}/{self.cadence_up}rpm, \
{datetime.strftime(self.tot_time, "%#M:%#S")}, \
{datetime.strftime(self.time_dwn, "%#S")}/\
{datetime.strftime(self.time_up, "%#S")}'

    def __repr__(self):
        try:
            if self.is_dist:
                return f'{self.training} {self.hearth_rate} {self.cadence}/{self.cadence_up} \
{self.tot_distance} {self.dst_dwn}/{self.dst_up}'
            return f'{self.training} {self.hearth_rate} {self.cadence}/{self.cadence_up} \
{datetime.strftime(self.tot_time, "%-M:%-S")}  \
{datetime.strftime(self.time_dwn, "%-M:%-S")}/\
{datetime.strftime(self.time_up, "%-M:%-S")}'
        except AttributeError:
            return object.__repr__(self)
        except ValueError:
            return f'{self.training} {self.hearth_rate} {self.cadence}/{self.cadence_up} \
{datetime.strftime(self.tot_time, "%#M:%#S")}  \
{datetime.strftime(self.time_dwn, "%#M:%#S")}/\
{datetime.strftime(self.time_up, "%#M:%#S")}'


class CicloDeEntrenamiento():
    '''Clase de la Clase'''
    repetitions = MinMaxRange(1, 100)

    def __init__(self):
        self.training_list = list()
        self.tot_class_time = timedelta()
        self.tot_class_distance = 0
        self.repetitions = 1

    def __iter__(self):
        return iter(self.training_list)

    def calc_time_and_distance(self):
        '''Run time and distance calculators'''
        self.calc_time()
        self.calc_distance()

    def calc_time(self):
        '''Calculates the total time of the training.'''
        self.tot_class_time = timedelta()
        for trng in self.training_list:
            if isinstance(trng, Entrenamiento) and not trng.is_dist:
                if trng.get_training() not in [10]:
                    self.tot_class_time += timedelta(
                        minutes=trng.tot_time.minute,
                        seconds=trng.tot_time.second)
            elif isinstance(trng, CicloDeEntrenamiento):
                self.tot_class_time += trng.tot_class_time
        self.tot_class_time *= self.repetitions

    def calc_distance(self):
        '''Calculates the total distance of the training.'''
        self.tot_class_distance = 0
        for trng in self.training_list:
            if isinstance(trng, Entrenamiento) and trng.is_dist:
                if trng.get_training() not in [10]:
                    self.tot_class_distance += trng.tot_distance
            elif isinstance(trng, CicloDeEntrenamiento):
                self.tot_class_distance += trng.tot_class_distance
        self.tot_class_distance *= self.repetitions

    def add_training(self, trnng_object):
        '''Add trainings to the list'''
        if isinstance(trnng_object, (Entrenamiento, CicloDeEntrenamiento)):
            self.training_list.append(trnng_object)
            self.calc_time_and_distance()
        else:
            raise DataError(trnng_object)

    def remove_training(self, pos=-1):
        '''remove training in the position indicated'''
        if pos < 1 or pos > len(self.training_list):
            raise RangeError(1, len(self.training_list))
        pos -= 1
        rmvd_trnng = self.training_list.pop(pos)
        self.calc_time_and_distance()
        return rmvd_trnng

    def insert_training(self, trnng_object, pos=-1):
        '''Insert training in the position indicated'''
        if isinstance(trnng_object, (Entrenamiento, CicloDeEntrenamiento)):
            self.training_list.insert(pos, trnng_object)
            self.calc_time_and_distance()
        else:
            raise DataError(trnng_object)

    def change_training(self, sel1, sel2):
        '''change of position elements on training_list'''
        self.training_list[sel1], self.training_list[sel2] = self.training_list[sel2], self.training_list[sel1]

    def check_if_cycle(self, sel):
        '''check if training_list element is a cycle and return it'''
        if isinstance(self.training_list[sel], Entrenamiento):
            return False
        elif isinstance(self.training_list[sel], CicloDeEntrenamiento):
            return self.training_list[sel]

    def edit_training(self, trnng_object, sel):
        '''Edit training element'''
        self.training_list[sel] = trnng_object
        self.calc_time_and_distance()


    def reps(self, reps):
        '''updates the repetitions value'''
        self.repetitions = reps
        self.calc_time_and_distance()

    def get_time(self):
        '''returns total time'''
        time_str = str(self.tot_class_time)
        if time_str[0] == '0':
            return time_str[2:]
        else:
            return str(self.tot_class_time)

    def get_distance(self):
        '''returns total distance'''
        return self.tot_class_distance

    def get_reps(self):
        '''returns repetitions'''
        return str(self.repetitions)

    def __len__(self):
        return len(self.training_list)

    def __str__(self):
        base = ''
        for i, trn in enumerate(self.training_list):
            base += f'{i+1}: {trn}\n'
        return f'{base}Total time: {self.tot_class_time}, Repetitions: {self.repetitions}'

    def __repr__(self):
        return f'<{self.training_list}\nTotal time: {self.tot_class_time}, Repetitions: {self.repetitions}>'

    def get_cmnd_track(self):
        '''returns string with the commands to build the training'''
        trnng_track = list()
        trnng_track.append(['I'])
        for trnng in self.training_list:
            if isinstance(trnng, CicloDeEntrenamiento):
                trnng_track += trnng.get_cmnd_track()
            else:
                trnng_track.append(repr(trnng).split())
        trnng_track.append(['F', self.repetitions])
        return trnng_track

    def __add__(self, other):
        if isinstance(other, CicloDeEntrenamiento):
            new_training_list = self.training_list + other.training_list
            new_cycle = CicloDeEntrenamiento()
            for trnng in new_training_list:
                new_cycle.add_training(trnng)
            return new_cycle
        else:

            return None

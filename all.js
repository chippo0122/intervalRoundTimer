const time = document.querySelectorAll('.time-select');
const timeSet = document.querySelector('.time-set');
const timeControl = document.querySelector('.time-control');
//clock UI
const clock = document.querySelector('.clock');
const clockTime = document.querySelector('.time-left');
const clockRound = document.querySelector('.round-left');
const clockStatus = document.querySelector('.status');
//time conrol sec
const redo = document.getElementById('redo');
const stop = document.getElementById('stop');
const go = document.getElementById('go');
//time set sec
const round = document.getElementById('round');
const restMin = document.getElementById('restMin');
const restSec = document.getElementById('restSec');
const workMin = document.getElementById('workMin');
const workSec = document.getElementById('workSec');
const btnClear = document.querySelector('.btn-clear');
const btnSend = document.querySelector('.btn-send');
//
const btnStop = document.querySelector('.btn-stop');
const btnRestart = document.querySelector('.btn-restart');
const click = document.querySelectorAll('.click');

let init = {
    writeOption: function (num, el) {
        let str = ``;
        for (let i = 0; i < num; i++) {
            if (num > 60) {
                str += `<option value="${i + 1}">${i + 1 < 10 ? '0' + (i + 1) : i + 1}</option>`
            } else {
                str += `<option value="${i}">${i < 10 ? '0' + i : i}</option>`
            }
        }
        el.innerHTML = str;
    },
    clear: function () {
        round.value = '1';
        time.forEach(function (i) {
            i.value = '0';
        })
    }
};

let sound = {
    data: {
        click: 'click.wav',
        finish: 'finish.wav',
        start: 'start.wav',
        countDown: 'countDown.wav',
        complete: 'complete.wav'
    },
    playAudio: function (sound) {
        const audio = new Audio('helpers/' + sound);
        audio.play();
    }
};
let count = {
    counting: null,
    pauseCounting: null,
    pauseBuffer: null,
    roundTime: 0,
    status: 0,
    counting: false,
    getRound: function () {
        this.roundTime = Number(round.value);
        //console.log(this.roundTime);
    },
    getTotalTime: function () {
        let workTime = Number(workMin.value) * 60 + Number(workSec.value);
        let restTime = Number(restMin.value) * 60 + Number(restSec.value);
        return [workTime, restTime];
    },
    runWork: function () {
        let total = this.getTotalTime();
        this.status = 1;
        write.status(this.status);
        sound.playAudio(sound.data.start);
        this.counting = setInterval(() => {
            let min = Math.floor(total[0] / 60);
            let sec = Math.floor(total[0] % 60);
            write.left([min > 9 ? min : '0' + min, sec > 9 ? sec : '0' + sec]);
            total[0]--;
            if (total[0] < 3 && total[0] >= 0) {
                sound.playAudio(sound.data.countDown);
            }
            if (total[0] < 0) {
                clearInterval(this.counting);
                this.counting = null;
                if (this.roundTime > 1) {
                    sound.playAudio(sound.data.finish);
                    this.runRest();
                } else {
                    sound.playAudio(sound.data.complete);
                    this.status = 3;
                    clockRound.innerHTML = '';
                    write.status(this.status);
                }
            }
        }, 1000)
    },
    runRest: function () {
        let total = this.getTotalTime();
        this.status = 2;
        write.status(this.status);
        this.counting = setInterval(() => {
            let min = Math.floor(total[1] / 60);
            let sec = Math.floor(total[1] % 60);
            write.left([min > 9 ? min : '0' + min, sec > 9 ? sec : '0' + sec]);
            total[1]--;
            if (total[1] < 3 && total[1] >= 0) {
                sound.playAudio(sound.data.countDown);
            }
            if (total[1] < 0) {
                clearInterval(this.counting);
                this.counting = null;
                if (this.roundTime > 0) {
                    sound.playAudio(sound.data.finish);
                    this.roundTime--;
                    write.roundleft(this.roundTime);
                    this.runWork();
                }
            }
        }, 1000)
    },
    runToggle: function () {
        let roundStatus = clockStatus.textContent;
        let left = clockTime.textContent.split(':');
        let totalTime = Number(left[0]) * 60 + Number(left[1]) - 1;
        if ( roundStatus !== 'Pause') {
            this.pauseBuffer = roundStatus;
            count.stop(count.counting);
            count.stop(count.pauseCounting);
            count.status = 4;
            write.status(4);
        } else {
            clearInterval(count.pauseCounting);
            count.pauseCounting = null;
            //console.log(roundStatus);
            if ( this.pauseBuffer === 'Work') {
                count.status = 1;
                write.status(1)
            } else {
                count.status = 2;
                write.status(2);
            }
            count.pauseCounting = setInterval(() => {
                let min = Math.floor(totalTime / 60);
                let sec = Math.floor(totalTime % 60);
                write.left([min > 9 ? min : '0' + min, sec > 9 ? sec : '0' + sec]);
                totalTime--;
                if (totalTime < 3 && totalTime >= 0) {
                    sound.playAudio(sound.data.countDown);
                }
                if (totalTime < 0) {
                    clearInterval(count.pauseCounting);
                    count.pauseCounting = null;
                    if (count.roundTime > 1) {
                        sound.playAudio(sound.data.finish);
                        write.roundleft(count.roundTime);
                        if ( this.pauseBuffer === 'Work') {
                            count.runRest();
                        } else {
                            count.runWork();
                            count.roundTime--;
                            write.roundleft(count.roundTime);
                        }
                    } else {
                        sound.playAudio(sound.data.complete);
                        this.status = 3;
                        clockRound.innerHTML = '';
                        write.status(this.status);
                    }
                }
            }, 1000)
            //console.log('resume', count.pauseCounting);
        }
    },
    stop: function (target) {
        clearInterval(target);
    },
    redo: function () {
        count.stop(count.counting);
        count.stop(count.pauseCounting);
        count.getRound();
        count.runWork();
        write.roundleft(count.roundTime);
        user.modalDismiss();
    }
}
let write = {
    reset: function () {
        this.status(0);
        clockRound.innerHTML = '';
        clockTime.innerHTML = '00:00';

    },
    left: function (arr) {
        clockTime.innerHTML = arr.join(':');
    },
    roundleft: function (num) {
        let str = num > 1 ? ' Rounds' : ' Round';
        clockRound.innerHTML = num + str + ' left';
    },
    status: function (num) {
        switch (num) {
            case 0:
                clockStatus.innerHTML = 'Seting';
                clock.classList.remove('complete');
                clock.classList.remove('rest');
                break;
            case 1:
                clockStatus.innerHTML = 'Work';
                clock.classList.remove('complete');
                clock.classList.remove('rest');
                break;
            case 2:
                clockStatus.innerHTML = 'Rest';
                clock.classList.add('rest');
                break;
            case 3:
                clockStatus.innerHTML = 'Complete';
                clock.classList.add('complete');
                break;
            case 4:
                clockStatus.innerHTML = 'Pause';
        }
    },
};
let user = {
    goStatus: false,
    //btn control
    goSwitch: function () {
        if (this.goStatus == false) {
            document.getElementById('play').classList.add('d-none');
            document.getElementById('pause').classList.remove('d-none');
            this.goStatus = true;
        } else {
            document.getElementById('pause').classList.add('d-none');
            document.getElementById('play').classList.remove('d-none');
            this.goStatus = false;
        }
    },
    //control pennel
    controlPopup: function () {
        timeSet.classList.add('d-none');
        timeControl.classList.remove('d-none');
        count.getRound();
        count.runWork();
        user.goSwitch();
        write.roundleft(count.roundTime);
    },
    setPopup: function () {
        timeControl.classList.add('d-none');
        timeSet.classList.remove('d-none');
        user.goSwitch();
        user.modalDismiss();
        count.stop(count.counting);
        count.stop(count.pauseCounting);
        write.reset();
    },
    modalCall: function (e) {
        let target = e.target.dataset.target;
        document.querySelectorAll('.modal').forEach((i) => {
            i.classList.add('d-none');
        })
        document.querySelector(target).classList.remove('d-none');
    },
    modalDismiss: function (e) {
        document.querySelectorAll('.modal').forEach((i) => {
            i.classList.add('d-none');
        });
    }
}

btnClear.addEventListener('click', init.clear);
btnSend.addEventListener('click', user.controlPopup);
stop.addEventListener('click', user.modalCall);
go.addEventListener('click', user.goSwitch);
go.addEventListener('click', count.runToggle);
redo.addEventListener('click', user.modalCall);
btnStop.addEventListener('click', user.setPopup);
document.querySelector('.modalST-dismiss').addEventListener('click', user.modalDismiss);
btnRestart.addEventListener('click', count.redo);
document.querySelector('.modalRS-dismiss').addEventListener('click', user.modalDismiss);
click.forEach((i) => {
    i.addEventListener('click', () => {
        sound.playAudio(sound.data.click);
    })
})

init.writeOption(99, round);
time.forEach(function (i) {
    init.writeOption(60, i);
})

let reservedSeats = [{
        seatNo: 'A2'
    },
    {
        seatNo: 'A3'
    },
    {
        seatNo: 'A4'
    },
    {
        seatNo: 'A1'
    },
    {
        seatNo: 'A5'
    },
    {
        seatNo: 'B5'
    },
    {
        seatNo: 'B4'
    },
    {
        seatNo: 'B15'
    },
    {
        seatNo: 'B11'
    }
]

const seatA = [];
const seatB = [];

const arrangedA = [];
const arrangedB = [];

reservedSeats = reservedSeats.filter((el, i) => el.seatNo.startsWith("A") ? seatA.push(el.seatNo.slice(1, el.seatNo.length)) : seatB.push(el.seatNo.slice(1, el.seatNo.length)));

for (let i = 0; i < seatA.length - 1; i++) {
    for (let j = 0; j < seatA.length - i - 1; j++) {
      if(seatA[j] > seatA[j + 1]){
        const temp = seatA[j];
        seatA[j] = seatA[i];
        seatA[i] = temp;
      }  
        
    }
}

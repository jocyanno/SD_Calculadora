const dgram = require('dgram');
const readline = require('readline');

const multicastAddress = '239.255.255.250';
const serverPort = 8070;
const localAddress = '127.0.0.1'; // Change this to your local IP address if needed

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayOperationsOnline() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
  console.log('4 - Desconectar');
}

function displayOperationsOffline() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
  console.log('4 - Reconectar');
}

function performLocalCalculation(operacao) {
  switch (operacao) {
    case '1':
      rl.question('Qual o comprimento da casa? ', function (comprimentoCasa) {
        rl.question('Qual a largura da casa? ', function (larguraCasa) {
          const areaCasa = comprimentoCasa * larguraCasa;
          console.log(`A área da casa é: ${areaCasa}`);
        });
      });
      break;

    case '2':
      rl.question('Qual o raio do círculo? ', function (raioCirculo) {
        const areaCirculo = Math.PI * raioCirculo * raioCirculo;
        console.log(`A área do círculo é: ${areaCirculo}`);
      });
      break;

    case '3':
      rl.question('Qual a massa do seu soco? ', function (massaSoco) {
        const poderSoco = massaSoco * Math.pow(299792458, 2);
        console.log(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!`);
      });
      break;
    case '4':
      client.addMembership(multicastAddress, localAddress); 
      displayOperationsOnline();
      break;
    default:
      console.log('Operação inválida!');
      break;
  }
}

const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

client.on('listening', () => {
  client.setBroadcast(true);
});

client.on('message', (data, remote) => {
  console.log('Resposta do servidor:', data.toString().trim());
});

client.on('error', (err) => {
  console.log(`Deu erro no cliente ${err}`);
  displayOperationsOffline();
});

client.bind(serverPort, localAddress, () => {
  console.log('Conectado ao servidor.');
  displayOperationsOnline();

  rl.on('line', function (operacao) {
    if (operacao === '4') {
      client.dropMembership(multicastAddress, localAddress);
      client.send(operacao, serverPort, serverIP);
    } else {
      client.send(operacao, serverPort, multicastAddress);
      console.log(`Resposta enviada: ${serverPort} ${operacao} ${multicastAddress}`)
    }
  });
});

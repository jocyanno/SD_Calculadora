const dgram = require('dgram');
const readline = require('readline');

const multicastAddress = '239.255.1.100'; // Endereço de multicast para comunicação
const serverPort = 8070;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayOperationsOnline() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
}
function displayOperationsOffline() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
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
    default:
      console.log('Operação inválida!');
      break;
  }
}

const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

client.on('listening', () => {
  client.addMembership(multicastAddress);
  client.setMulticastTTL(128); // Configura o TTL para alcance da rede
  console.log('Cliente aguardando respostas do servidor em multicast.');
  displayOperationsOffline();
});

client.on('message', (message, remote) => {
  console.log('Resposta do servidor:', message.toString().trim());
});

client.on('error', (err) => {
  console.log('Deu erro no cliente:', err);
  displayOperationsOffline();
});

// Envia uma mensagem multicast para que o servidor identifique o cliente
client.send('Ola', serverPort, multicastAddress, (err) => {
  if (err) {
    console.log('Erro ao enviar mensagem multicast:', err);
  }
});

rl.on('line', function (operacao) {
  client.send(operacao, serverPort, multicastAddress, (err) => {
    if (err) {
      console.log('Erro ao enviar mensagem multicast:', err);
    }
  });
});
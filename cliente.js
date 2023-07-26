const dgram = require('dgram');
const readline = require('readline');

const multicastAddress = '239.255.1.100'; // Endereço de multicast para comunicação
const serverPort = 8080;
const clientePort = 8070
const tentativasMax = 4;
let tentativas = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayOperations() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
}

const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

client.bind(clientePort, () => {
  client.addMembership(multicastAddress);
  client.setMulticastTTL(128);
  displayOperations();
});

rl.on('line', function (operacao) {
  client.send(operacao, serverPort, multicastAddress, (err) => {
    if (err) {
      console.log('Erro ao enviar mensagem multicast:', err);
    }
  });
});
client.on('listening', () => {
  console.log('Cliente aguardando respostas do servidor em multicast.');

});

client.on('message', (message, remote) => {
  console.log('Resposta do servidor:', message.toString().trim());
});

client.on('error', (err) => {
  console.log('Deu erro no cliente:', err);
});



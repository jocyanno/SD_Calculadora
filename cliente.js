const dgram = require('dgram');
const readline = require('readline');

const multicastAddress = '239.255.1.100'; // Endereço de multicast para comunicação
const serverPort = 8070;

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

client.on('listening', () => {
  client.addMembership(multicastAddress);
  client.setMulticastTTL(128); // Configura o TTL para alcance da rede
  console.log('Cliente aguardando respostas do servidor em multicast.');
  displayOperations();  

});

client.on('message', (message, remote) => {
  console.log('Resposta do servidor:', message.toString().trim());
});

client.on('error', (err) => {
  console.log('Deu erro no cliente:', err);
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
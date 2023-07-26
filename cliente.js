const dgram = require('dgram');
const readline = require('readline');

const multicastAddress = '239.255.1.100'; // Endereço de multicast para comunicação
const serverPort = 8080;
const clientePort = 8070;
const tentativasMax = 4;
let tentativas = 0;
let isConnected = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pingServer() {
  const MensagemPing = 'PING';

  client.send(MensagemPing, serverPort, multicastAddress, (err) => {
    if (err) {
      console.log('Erro ao enviar mensagem multicast:', err);
    }
  });
}

// Verificação periódica do servidor a cada 5 segundos
setInterval(() => {
    
  if (tentativas < tentativasMax) {
    if (!isConnected) {
      pingServer();
      tentativas+= 1;
      console.log(tentativas)
    }
  } else {
    console.log('O servidor não respondeu após várias tentativas. Verifique a conexão e tente novamente mais tarde.');
    rl.close();
    client.close();
    process.exit(1)
  }
}, 5000);

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
  const response = message.toString().trim();

  if (response === 'PONG') {
    isConnected = true; 
  } else {
    console.log('Resposta do servidor:', response);
  }
});

client.on('error', (err) => {
  console.log('Deu erro no cliente:', err);
});
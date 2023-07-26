const dgram = require('dgram');
const readline = require('readline');

const multicastAddress = '239.255.1.100'; // Endereço de multicast para comunicação
const serverPort = 8080;
const clientePort = 8070;
const serverBackupPort = 8081;
const tentativasMax = 4;

let tentativas = 0;
let Conectado = false;
let serverAtual = 'original';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para enviar mensagem de ping ao servidor
function pingServer() {
  const MensagemPing = 'PING';

  client.send(MensagemPing, serverAtual === 'original' ? serverPort : serverBackupPort, multicastAddress, (err) => {
    if (err) {
      console.log('Erro ao enviar mensagem multicast:', err);
      Conectado = false;
    }
  });
}

// Verificação periódica do servidor a cada 5 segundos
setInterval(() => {
  if (tentativas < tentativasMax) {
    if (!Conectado) {
      tentativas += 1;
      pingServer();
    }
  } else {
    serverAtual = serverAtual === 'original' ? 'backup' : 'original';
    tentativas = 0;
  }
}, 2000);

// Função para exibir as operações disponíveis
function displayOperations() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
}

const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

client.on('listening', () => {
  client.addMembership(multicastAddress);
  client.setMulticastTTL(128);
  displayOperations();
});

client.on('message', (message) => {
  const response = message.toString().trim();

  if (response === 'PONG') {
    Conectado = true;
    tentativas = 0;
  } else {
    console.log('Resposta do servidor:', response);
  }
});

client.on('error', (err) => {
  console.log('Deu erro no cliente:', err);
  Conectado = false;
});

// Evento de leitura de entrada do usuário para enviar as operações ao servidor
rl.on('line', function (operacao) {
  client.send(operacao, serverAtual === 'original' ? serverPort : serverBackupPort, multicastAddress, (err) => {
    if (err) {
      console.log('Erro ao enviar mensagem multicast:', err);
    }
  });
});

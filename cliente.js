const dgram = require('dgram');
const readline = require('readline');

const multicastAddress = '239.255.1.100';
const serverPort = 8080;
const serverBackupPort = 8081;
const tentativasMax = 4;
const intervaloTimeout = 2000; // 5 segundos de timeout


let tentativas = 0;
let Conectado = false;
let serverAtual = 'original';
let reqServidor= 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pingServer() {
  const MensagemPing = 'PING';

  client.send(MensagemPing, serverAtual === 'original' ? serverPort : serverBackupPort, multicastAddress, (err) => {
    if (err) {
      console.log('Erro ao enviar mensagem multicast:', err);
      Conectado = false;
    }
  });
}

function checkServerStatus() {
    Conectado = false;
  if (tentativas < tentativasMax) {
    if (!Conectado) {
      if(tentativas>1){ console.log('Reconectando: '+ serverAtual)}
     
      tentativas += 1;
      pingServer();
    }
  } else {
    if(reqServidor <=4){
      serverAtual = serverAtual === 'original' ? 'backup' : 'original';
      tentativas = 0;
      reqServidor = reqServidor+ 4;
      Conectado = true;
      console.log('Devido a algum problema de conexão foi necessário fazer a troca para o servidor: ' + serverAtual);
      displayOperations()
    }else{
      console.log('Deu ruim, tamo sem servidor');
      process.exit(0)
    }
  }
}

function displayOperations() {
  console.log('Escolha uma operação:');
  console.log('1 - Área de uma casa');
  console.log('2 - Área de um círculo');
  console.log('3 - O poder do seu soco no espaço, na velocidade da luz');
  console.log("4 - Juros Simples");
  console.log("5 - Juros Composto");
}

const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });
displayOperations();
pingServer()
client.on('listening', () => {
  client.addMembership(multicastAddress);
  client.setMulticastTTL(128);
  setInterval(checkServerStatus, intervaloTimeout); // Adicionando o intervalo de verificação do status do servidor
});

client.on('message', (message) => {
  const response = message.toString().trim();

  if (response === 'PONG') {
    Conectado = true;
    tentativas = 0;
    reqServidor = 0;
  } else {
    console.log('Resposta do servidor:', response);
  }
});

client.on('error', (err) => {
  console.log('Deu erro no cliente:', err);
  Conectado = false;
});

rl.on('line', function (operacao) {
  if (operacao === 'sair') { // Verificando se o usuário digitou 'exit' para encerrar o programa
    client.close(() => process.exit(0));
  } else {
    client.send(operacao, serverAtual === 'original' ? serverPort : serverBackupPort, multicastAddress, (err) => {
      if (err) {
        console.log('Erro ao enviar mensagem multicast:', err);
      }
    });
  }
});

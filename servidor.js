const net = require('net');
const dgram = require('dgram');
const serverPort = 8070;
let nextClientId = 1;
const clients = [];

// Endereço IP e porta para o grupo multicast
const MULTICAST_ADDRESS = '239.255.255.250';
const PORT = 8070;

// Estados possíveis do cliente
const ClientState = {
  IDLE: 'IDLE', // O cliente não está realizando nenhum cálculo
  AWAITING_LENGTH: 'AWAITING_LENGTH', // O cliente está aguardando o envio do comprimento da casa
  AWAITING_WIDTH: 'AWAITING_WIDTH', // O cliente está aguardando o envio da largura da casa
  AWAITING_RADIUS: 'AWAITING_RADIUS', // O cliente está aguardando o envio do raio do círculo
  AWAITING_MASS: 'AWAITING_MASS', // O cliente está aguardando o envio da massa do soco
};


const sendMulticastMessage = (message) => {
  const socket = dgram.createSocket('udp4');
  const messageBuffer = Buffer.from(message);

  socket.bind(8070, MULTICAST_ADDRESS,() => {
    socket.setBroadcast(true);
    socket.send(messageBuffer, 0, messageBuffer.length, PORT, MULTICAST_ADDRESS, (err) => {
      if (err) {
        console.error('Erro ao enviar mensagem multicast:', err);
      }
      socket.close();
    });
  });
};

const processRequest = (socket, clientId, data) => {
  const client = clients.find((client) => client.id === clientId);
  if (!client) {
    console.error(`Cliente ${clientId} não encontrado.`);
    return;
  }

  const { currentState } = client;
  try {
    switch (currentState) {
      case ClientState.IDLE:
        // O cliente está enviando a operação desejada
        const operacao = data.toString().trim();
        switch (operacao) {
          case '1':
            client.currentState = ClientState.AWAITING_LENGTH;
            sendMulticastMessage("Qual o comprimento da casa?");
            break;
          case '2':
            client.currentState = ClientState.AWAITING_RADIUS;
            sendMulticastMessage("Qual o raio do círculo?");
            break;
          case '3':
            client.currentState = ClientState.AWAITING_MASS;
            sendMulticastMessage("Qual a massa do seu soco?");
            break;
          case '4':
            console.log(`Cliente escolheu ${clientId} estar desconectado.`);
            socket.destroy();
            break;
          default:
            sendMulticastMessage('Operação inválida!');
            break;
        }
        break;

      case ClientState.AWAITING_LENGTH:
        // O cliente enviou o comprimento da casa, agora aguardamos a largura
        client.comprimentoCasa = parseFloat(data);
        client.currentState = ClientState.AWAITING_WIDTH;
        sendMulticastMessage("Qual a largura da casa?");
        break;

      case ClientState.AWAITING_WIDTH:
        // O cliente enviou a largura da casa, podemos calcular a área
        const larguraCasa = parseFloat(data);
        const areaCasa = client.comprimentoCasa * larguraCasa;
        console.log(`Cliente ${clientId} enviou comprimento: ${client.comprimentoCasa}, largura: ${larguraCasa}`);
        sendMulticastMessage(`A área da casa é: ${areaCasa}`);
        client.currentState = ClientState.IDLE;
        break;

      case ClientState.AWAITING_RADIUS:
        // O cliente enviou o raio do círculo, podemos calcular a área
        const raioCirculo = parseFloat(data);
        const areaCirculo = Math.PI * raioCirculo * raioCirculo;
        console.log(`Cliente ${clientId} enviou raio do círculo: ${raioCirculo}`);
        sendMulticastMessage(`A área do círculo é: ${areaCirculo}`);
        client.currentState = ClientState.IDLE;
        break;

      case ClientState.AWAITING_MASS:
        // O cliente enviou a massa do soco, podemos calcular o poder do soco
        const massaSoco = parseFloat(data);
        const poderSoco = massaSoco * Math.pow(299792458, 2);
        console.log(`Cliente ${clientId} enviou massa do soco: ${massaSoco}`);
        sendMulticastMessage(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!`);
        client.currentState = ClientState.IDLE;
        break;

      default:
        sendMulticastMessage('Operação inválida!');
        break;
    }
  } catch (err) {
    console.error(`Erro ao processar a solicitação do cliente ${clientId}:`, err);
  }
};

const server = net.createServer(function (socket) {
  const clientId = nextClientId++;
  clients.push({ id: clientId, socket, currentState: ClientState.IDLE });

  console.log(`Cliente ${clientId} conectado.`);

  socket.on("data", (data) => {
    console.log(`Requisição recebida do cliente ${clientId}: ${data.toString().trim()}`);
    processRequest(socket, clientId, data);
  });

  socket.on("error", (err) => {
    console.error(`Erro ao processar a solicitação do cliente ${clientId}:`, err);
  });

  socket.on("end", () => {
    console.log(`Cliente ${clientId} desconectado.`);
    const index = clients.findIndex((client) => client.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });

  //Quando um cliente está inativo por muito tempo o servidor vai desconecta-lo para poupar recursos
  socket.setTimeout(0.5 * 60 * 1000, () => {
    console.log(`Cliente ${clientId} desconectado devido a inatividade.`);
    socket.destroy()
  });
  
});

server.listen(serverPort, function () {
  console.log(`Servidor escutando na porta ${PORT}`);
});

const dgram = require('dgram');
const serverPort = 8070;
const clients = [];

// Estados possíveis do cliente
const ClientState = {
  IDLE: 'IDLE', // O cliente não está realizando nenhum cálculo
  AWAITING_LENGTH: 'AWAITING_LENGTH', // O cliente está aguardando o envio do comprimento da casa
  AWAITING_WIDTH: 'AWAITING_WIDTH', // O cliente está aguardando o envio da largura da casa
  AWAITING_RADIUS: 'AWAITING_RADIUS', // O cliente está aguardando o envio do raio do círculo
  AWAITING_MASS: 'AWAITING_MASS', // O cliente está aguardando o envio da massa do soco
};
const getClientById = (clientId) => {
  return clients.find((client) => client.id === clientId);
};

const processRequest = (msg, rinfo) => {
  const clientId = rinfo.address + ':' + rinfo.port;
  let client = getClientById(clientId);
  if (!client) {
    client = { id: clientId, currentState: ClientState.IDLE };
    clients.push(client);
  }

  console.log(`Requisição do cliente recebida: ${msg}/${client.currentState}`);
  try {
    switch (client.currentState) {
      case ClientState.IDLE:
        // O cliente está enviando a operação desejada
        const operacao = msg.toString().trim();
        switch (operacao) {
          case '1':
            client.currentState = ClientState.AWAITING_LENGTH;
            server.send("Qual o comprimento da casa?", rinfo.port, rinfo.address);
            break;
          case '2':
            client.currentState = ClientState.AWAITING_RADIUS;
            server.send("Qual o raio do círculo?", rinfo.port, rinfo.address);
            break;
          case '3':
            client.currentState = ClientState.AWAITING_MASS;
            server.send("Qual a massa do seu soco?", rinfo.port, rinfo.address);
            break;
          default:
            server.send('Operação inválida!', rinfo.port, rinfo.address);
            break;
        }
        break;

      case ClientState.AWAITING_LENGTH:
        // O cliente enviou o comprimento da casa, agora aguardamos a largura
        client.comprimentoCasa = parseFloat(msg);
        client.currentState = ClientState.AWAITING_WIDTH;
        server.send("Qual a largura da casa?", rinfo.port, rinfo.address);
        break;

      case ClientState.AWAITING_WIDTH:
        // O cliente enviou a largura da casa, podemos calcular a área
        const larguraCasa = parseFloat(msg);
        const areaCasa = client.comprimentoCasa * larguraCasa;
        console.log(`Cliente ${clientId} enviou comprimento: ${client.comprimentoCasa}, largura: ${larguraCasa}`);
        server.send(`A área da casa é: ${areaCasa}`, rinfo.port, rinfo.address);
        client.currentState = ClientState.IDLE;
        break;

      case ClientState.AWAITING_RADIUS:
        // O cliente enviou o raio do círculo, podemos calcular a área
        const raioCirculo = parseFloat(msg);
        const areaCirculo = Math.PI * raioCirculo * raioCirculo;
        console.log(`Cliente ${clientId} enviou raio do círculo: ${raioCirculo}`);
        server.send(`A área do círculo é: ${areaCirculo}`, rinfo.port, rinfo.address);
        client.currentState = ClientState.IDLE;
        break;

      case ClientState.AWAITING_MASS:
        // O cliente enviou a massa do soco, podemos calcular o poder do soco
        const massaSoco = parseFloat(msg);
        const poderSoco = massaSoco * Math.pow(299792458, 2);
        console.log(`Cliente ${clientId} enviou massa do soco: ${massaSoco}`);
        server.send(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!`, rinfo.port, rinfo.address);
        client.currentState = ClientState.IDLE;
        break;

      default:
        server.send('Operação inválida!', rinfo.port, rinfo.address);
        break;
    }
  } catch (err) {
    console.error(`Erro ao processar a solicitação do cliente ${clientId}:`, err);
  }
};

const server = dgram.createSocket('udp4');

server.on('listening', function () {
  const address = server.address();
  console.log(`Servidor escutando na porta ${address.port}`);
});

server.on('message', processRequest);

server.on('error', function (err) {
  console.error('Erro no servidor:', err);
});

server.bind(serverPort);

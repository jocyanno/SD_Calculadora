const net = require('net');
const serverPort = 8070;
let nextClientId = 1;
const clients = [];

// Estados possíveis do cliente
const ClientState = {
  IDLE: 'IDLE', // O cliente não está realizando nenhum cálculo
  AWAITING_LENGTH: 'AWAITING_LENGTH', // O cliente está aguardando o envio do comprimento da casa
  AWAITING_WIDTH: 'AWAITING_WIDTH', // O cliente está aguardando o envio da largura da casa
  AWAITING_RADIUS: 'AWAITING_RADIUS', // O cliente está aguardando o envio do raio do círculo
  AWAITING_MASS: 'AWAITING_MASS', // O cliente está aguardando o envio da massa do soco
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
            socket.write("Qual o comprimento da casa?\n");
            break;
          case '2':
            client.currentState = ClientState.AWAITING_RADIUS;
            socket.write("Qual o raio do círculo?\n");
            break;
          case '3':
            client.currentState = ClientState.AWAITING_MASS;
            socket.write("Qual a massa do seu soco?\n");
            break;
          default:
            socket.write('Operação inválida!\n');
            break;
        }
        break;

      case ClientState.AWAITING_LENGTH:
        // O cliente enviou o comprimento da casa, agora aguardamos a largura
        client.comprimentoCasa = parseFloat(data);
        client.currentState = ClientState.AWAITING_WIDTH;
        socket.write("Qual a largura da casa?\n");
        break;

      case ClientState.AWAITING_WIDTH:
        // O cliente enviou a largura da casa, podemos calcular a área
        const larguraCasa = parseFloat(data);
        const areaCasa = client.comprimentoCasa * larguraCasa;
        console.log(`Cliente ${clientId} enviou comprimento: ${client.comprimentoCasa}, largura: ${larguraCasa}`);
        socket.write(`A área da casa é: ${areaCasa}\n`);
        client.currentState = ClientState.IDLE;
        break;

      case ClientState.AWAITING_RADIUS:
        // O cliente enviou o raio do círculo, podemos calcular a área
        const raioCirculo = parseFloat(data);
        const areaCirculo = Math.PI * raioCirculo * raioCirculo;
        console.log(`Cliente ${clientId} enviou raio do círculo: ${raioCirculo}`);
        socket.write(`A área do círculo é: ${areaCirculo}\n`);
        client.currentState = ClientState.IDLE;
        break;

      case ClientState.AWAITING_MASS:
        // O cliente enviou a massa do soco, podemos calcular o poder do soco
        const massaSoco = parseFloat(data);
        const poderSoco = massaSoco * Math.pow(299792458, 2);
        console.log(`Cliente ${clientId} enviou massa do soco: ${massaSoco}`);
        socket.write(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!\n`);
        client.currentState = ClientState.IDLE;
        break;

      default:
        socket.write('Operação inválida!\n');
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
  console.log(`Servidor escutando na porta ${serverPort}`);
});

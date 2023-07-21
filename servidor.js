const net = require('net');
const serverPort = 8070;
let nextClientId = 1;
const clients = [];

const processRequest = (socket, clientId, data) => {
  try {
    switch (data) {
      case '1':
        socket.write("Qual o comprimento da casa?\n");
        socket.once("data", (comprimentoCasa) => {
          comprimentoCasa = parseFloat(comprimentoCasa);
          socket.write("Qual a largura da casa?\n");
          socket.once("data", (larguraCasa) => {
            larguraCasa = parseFloat(larguraCasa);
            const areaCasa = comprimentoCasa * larguraCasa;
            socket.write(`A área da casa é: ${areaCasa}\n`);
          });
        });
        break;

      case '2':
        socket.write("Qual o raio do círculo?\n");
        socket.once("data", (raioCirculo) => {
          raioCirculo = parseFloat(raioCirculo);
          const areaCirculo = Math.PI * raioCirculo * raioCirculo;
          socket.write(`A área do círculo é: ${areaCirculo}\n`);
        });
        break;

      case '3':
        socket.write("Qual a massa do seu soco?\n");
        socket.once("data", (massaSoco) => {
          massaSoco = parseFloat(massaSoco);
          const poderSoco = massaSoco * Math.pow(299792458, 2);
          socket.write(`Seu soco teria o poder de ${poderSoco} joules, poderia causar uma catástrofe!\n`);
        });
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
  clients.push({ id: clientId, socket });

  console.log(`Cliente ${clientId} conectado.`);

  socket.on("data", (data) => {
    console.log(`Requisição recebida do cliente ${clientId}: ${data.toString().trim()}`);
    processRequest(socket, clientId, data.toString().trim());
  });

  socket.on("error", (err) => {
    console.error(`Erro ao processar a solicitação do cliente ${clientId}:, err`);
  });

  socket.on("end", () => {
    console.log(`Cliente ${clientId} desconectado.`);
    const index = clients.findIndex((client) => client.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

server.listen(serverPort, function () {
  console.log(`Servidor escutando na porta ${serverPort}`);
});

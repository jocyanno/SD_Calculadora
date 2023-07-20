const net = require('net');
const serverPort = 8070; // Porta do servidor
let nextClientId = 1; // Variável para controlar os identificadores dos clientes
const clients = []; // Array para armazenar os clientes conectados

const processRequest = async (socket, clientId) => {
  try {
    socket.on('data', (data) => {
      console.log(`Resposta enviada do cliente ${clientId}: ${data.toString().trim()}`);
    });

    socket.on('error', (err) => {
      console.error(`Erro ao processar a solicitação do cliente ${clientId}:, err`);
    });

    // Opcionalmente, você pode adicionar um evento 'end' para tratar a desconexão do cliente
    socket.on('end', () => {
      console.log(`Cliente ${clientId} desconectado.`);
      const index = clients.findIndex((client) => client.id === clientId);
      if (index !== -1) {
        clients.splice(index, 1); // Remove o cliente da lista de clientes conectados
      }
    });
  } catch (err) {
    console.error(`Erro ao processar a solicitação do cliente ${clientId}:, err`);
  }
};

const server = net.createServer(function (socket) {
  const clientId = nextClientId++; // Atribui um identificador único ao cliente conectado
  clients.push({ id: clientId, socket }); // Adiciona o cliente à lista de clientes conectados

  console.log(`Cliente ${clientId} conectado.`);

  processRequest(socket, clientId);
});

server.listen(serverPort, function () {
  console.log(`Servidor escutando na porta ${serverPort}`);
});
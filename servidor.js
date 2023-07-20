const net = require('net');

const serverPort = 8070; // Porta do servidor
let nextClientId = 1; // Variável para controlar os identificadores dos clientes
const clients = []; // Array para armazenar os clientes conectados

const server = net.createServer(function (socket) {
  const clientId = nextClientId++; // Atribui um identificador único ao cliente conectado
  clients.push({ id: clientId, socket }); // Adiciona o cliente à lista de clientes conectados

  console.log(`Cliente ${clientId} conectado.`);

  socket.on('data', function (data) {
    console.log(`Resposta enviada do cliente ${clientId}: ` + data.toString().trim());
  });

  socket.on('end', function () {
    console.log(`Cliente ${clientId} desconectado.`);
    const index = clients.findIndex((client) => client.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1); // Remove o cliente da lista de clientes conectados
    }
  });
});

server.listen(serverPort, function () {
  console.log(`Servidor escutando na porta ${serverPort}`);
});

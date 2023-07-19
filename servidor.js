const net = require('net');

const serverPort = 8070; // Porta do servidor
let nextClientId = 1; // Variável para controlar os identificadores dos clientes
const clients = []; // Array para armazenar os clientes conectados

const server = net.createServer(function (socket) {
  const clientId = nextClientId++; // Atribui um identificador único ao cliente conectado
  clients.push({ id: clientId, socket }); // Adiciona o cliente à lista de clientes conectados

  console.log(`Cliente ${clientId} conectado.`);

  socket.on('data', function (data) {
    const operacao = data.toString().trim(); // Recebe a operação enviada pelo cliente

    switch (operacao) {
      case '1':
        socket.write('Você enviou resposta 1 para o servidor'); // Envia uma resposta para o cliente
        break;

      case '2':
        socket.write('Você enviou resposta 2 para o servidor'); // Envia uma resposta para o cliente
        break;

      case '3':
        socket.write('Você enviou resposta 3 para o servidor'); // Envia uma resposta para o cliente
        break;

      default:
        socket.write('Operação inválida.'); // Envia uma resposta para o cliente
        break;
    }

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

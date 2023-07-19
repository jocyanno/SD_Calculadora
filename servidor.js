const net = require("net");

const serverPort = 8070; // Porta do servidor

const server = net.createServer(function (socket) {
  console.log("Cliente conectado.");

  socket.on("data", function (data) {
    const operacao = data.toString().trim(); // Recebe a operação enviada pelo cliente

    switch (operacao) {
      case "1":
        socket.write("Você enviou resposta 1 para o servidor"); // Envia uma resposta para o cliente
        break;

      case "2":
        socket.write("Você enviou resposta 2 para o servidor"); // Envia uma resposta para o cliente
        break;

      case "3":
        socket.write("Você enviou resposta 3 para o servidor"); // Envia uma resposta para o cliente
        break;

      default:
        socket.write("Operação inválida."); // Envia uma resposta para o cliente
        break;
    }

    console.log('Resposta enviada do cliente: ' + data.toString().trim());
  });

  socket.on("end", function () {
    console.log("Cliente desconectado.");
    socket.end(); // Encerra a conexão com o cliente
  });
});

server.listen(serverPort, function () {
  console.log(`Servidor escutando na porta ${serverPort}`);
});

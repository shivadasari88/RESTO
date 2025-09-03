const emitNewOrder = (io, order) => {
  io.emit('newOrder', order);
  io.to('admin').to('kitchen').emit('newOrder', order);
};

const emitOrderStatusUpdate = (io, order) => {
  io.emit('orderStatusUpdated', order);
  io.to('admin').to('kitchen').to('runner').emit('orderStatusUpdated', order);
  if (order.tableId && order.tableId._id) {
    io.to(`table-${order.tableId._id}`).emit('orderStatusUpdated', order);
  }
};

const emitKitchenNotification = (io, message) => {
  io.to('kitchen').emit('kitchenNotification', message);
};

module.exports = {
  emitNewOrder,
  emitOrderStatusUpdate,
  emitKitchenNotification
};
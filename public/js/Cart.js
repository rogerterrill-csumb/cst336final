'use strict';

class Cart {
  static _addToCart(product = null, cart) {
    let index = this._inCart(product, cart);
    if (index != -1) {
      cart.items[index].qty += 1;
    } else {
      let item = {
        id: product.id,
        imageURL: product.imageURL,
        description: product.description,
        price: product.price,
        qty: product.qty
      };
      cart.items.push(item);
    }
  }

  static _removeFromCart() {}

  static _updateCart() {}

  static _inCart(item, cart) {
    const id = element => element.id == item.id;
    return cart.items.findIndex(id);
  }

  static _calculateTotal(cart) {
    cart.items.reduce()

  }

  static emptyCart() {}

  static setFormatTotals() {}
}

module.exports = Cart;

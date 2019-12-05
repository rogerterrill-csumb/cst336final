"use strict";

class Cart {
  static _addToCart(product = null, cart) {
    let index = this._inCart(product.id, cart);
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

  static _removeFromCart(id, cart) {
    cart.items = cart.items.filter(item => item.id != id)
  }

  static _updateCart(id, qty, cart) {
    let index = this._inCart(id, cart);
    cart.items[index].qty = qty;
  }

  static _inCart(itemid, cart) {
    const id = element => element.id == itemid;
    return cart.items.findIndex(id);
  }

  static _emptyCart(cart) {
      cart.items = [];
  }

  static _formatTime(date){
      return `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`
  }
}

module.exports = Cart;

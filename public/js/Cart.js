'use strict'

class Cart{

    static _addToCart(product = null, qty = 1, cart){
        let item = {
            id: product.id,
            imageURL: product.imageURL,
            description: product.description,
            price: product.price
        }
        cart.items.push(item);
    }

    static _removeFromCart(){

    }

    static _updateCart(){

    }

    static _inCart(){

    }

    static _calculateTotal(){

    }

    static emptyCart() {

    }

    static setFormatTotals(){

    }


}

module.exports = Cart;
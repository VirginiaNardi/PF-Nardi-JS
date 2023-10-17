fetch('./info.json')
    .then(respuesta => respuesta.json())
    .then(productos => {



        let carritoRecuperado = localStorage.getItem("carrito")
        let carrito = carritoRecuperado ? JSON.parse(carritoRecuperado) : []

        renderizarCarrito(carrito)
        renderizarProductos(productos, carrito)

        //BUSCADOR (terminar)
        let buscador = document.getElementById('buscador')
        let botonBuscar = document.getElementById('buscar')
        botonBuscar.addEventListener('click', () => filtrarYRenderizar(productos))

        //BOTONES DE CATEGORIA
        let botonesCategorias = document.getElementsByClassName('filtroCategoria')
        for (const botonCategoria of botonesCategorias) {
            botonCategoria.addEventListener('click', (e) => filtrarPorCategoria(e, productos))
        }


        function filtrarPorCategoria(e, productos) {
            let productosFiltrados = productos.filter(producto => {
                return producto.categoria === e.target.id
            })
            renderizarProductos(productosFiltrados)
        }

        function filtrarYRenderizar(productos) {
            let terminoBusqueda = buscador.value.toUpperCase()
            let productosFiltrados = productos.filter(producto => {
                return producto.equipo.toUpperCase().includes(terminoBusqueda)
            });

            if (productosFiltrados.length === 0) {
                mostrarMensaje("No se han encontrado productos, intente con otro nombre")
            } else {
                renderizarProductos(productosFiltrados);
            }
            buscador.value = ''
        }

        function mostrarMensaje(mensaje) {
            let contenedor = document.getElementById('contenedorProductos')
            contenedor.innerHTML = `<p>${mensaje}</p>`
        }

        function limpiarMensaje() {
            let contenedor = document.getElementById('contenedorProductos')
            contenedor.innerHTML = ''
        }

        //ORDERNAR PRODUCTOS
        let selectOrdenarPor = document.getElementById('ordenarPor')

        selectOrdenarPor.addEventListener('change', () => {
            ordenarProductos()
        })
        function ordenarProductos() {
            let selectedValue = selectOrdenarPor.value
            let productosOrdenados = [...productos]

            if (selectedValue === 'ascendente') {
                productosOrdenados.sort((a, b) => a.precio - b.precio)
            } else if (selectedValue === 'descendente') {
                productosOrdenados.sort((a, b) => b.precio - a.precio)
            }
            renderizarProductos(productosOrdenados);
        }

        //TARJETAS


        function renderizarProductos(productos) {
            let contenedor = document.getElementById('contenedorProductos')
            contenedor.innerHTML = ''

            productos.forEach(producto => {
                let tarjeta = document.createElement('div')
                tarjeta.className = 'tarjeta'
                tarjeta.innerHTML = `
        <h3 class='nombreEquipo'>${producto.equipo.toUpperCase()}</h3>
        <img class='imgCamiseta' src=./img/${producto.img}>
        <h6>$${producto.precio}</h6>
        <button class='BotonACarrito' id=${producto.id}>Agregar al carrito</button>
        `
                contenedor.appendChild(tarjeta)

                let botonAgregarAlCarrito = document.getElementById(producto.id)
                botonAgregarAlCarrito.addEventListener('click', (e) => agregarProductoAlCarrito(productos, carrito, e))
            })
        }

        function agregarProductoAlCarrito(productos, carrito, e) {
            let productoBuscado = productos.find(producto => producto.id === Number(e.target.id))
            let productoEnCarrito = carrito.find(producto => producto.id === productoBuscado.id)

            if (productoBuscado.stock > 0) {
                if (productoEnCarrito) {
                    productoEnCarrito.unidades++
                    productoEnCarrito.subtotal = productoEnCarrito.unidades * productoEnCarrito.precioUnitario
                } else {
                    carrito.push({
                        id: productoBuscado.id,
                        equipo: productoBuscado.equipo,
                        precioUnitario: productoBuscado.precio,
                        unidades: 1,
                        subtotal: productoBuscado.precio
                    })
                }
                productoBuscado.stock--
                tostada('Se agrego un producto al carrito', 1000)
                localStorage.setItem('carrito', JSON.stringify(carrito))
            } else {
                tostada('No hay mas stock del producto seleccionado', 1000)
            }
            renderizarCarrito(carrito)
        }


        function renderizarCarrito(productosEnCarrito) {
            if (productosEnCarrito.length > 0) {
                let divCarrito = document.getElementById("carrito")
                divCarrito.innerHTML = ""

                productosEnCarrito.forEach(producto => {
                    let tarjProdCarrito = document.createElement("div")
                    tarjProdCarrito.className = "tarjProdCarrito"
                    tarjProdCarrito.innerHTML = `
          <p>PRODUCTO: ${producto.equipo}</p>
          <p>PRECIO UNITARIO: $${producto.precioUnitario}</p>
          <p>UNIDADES: ${producto.unidades}</p>
          <p>SUBTOTAL: $${producto.subtotal}</p>
        `
                    divCarrito.appendChild(tarjProdCarrito)
                    if (producto !== productosEnCarrito[productosEnCarrito.length - 1]) {
                        let hr = document.createElement("hr")
                        divCarrito.appendChild(hr)
                    }
                })

                let boton = document.createElement("button")
                boton.innerHTML = "Finalizar compra"
                boton.className = 'finalizarCompra'
                boton.addEventListener("click", finalizarCompra)
                divCarrito.appendChild(boton)
            }
        }

        let botonVerOcultar = document.getElementById("verOcultar")
        botonVerOcultar.addEventListener("click", verOcultarCarrito)

        function verOcultarCarrito() {
            let carrito = document.getElementById("carrito")
            let contenedorProductos = document.getElementById("contenedorProductos")

            carrito.classList.toggle("oculta")
            contenedorProductos.classList.toggle("oculta")
        }


        // let carritoLink = document.getElementById('verOcultar')
        // let labelOrdenarPor = document.getElementById('labelOrdenarPor')

        // carritoLink.addEventListener('click', () => {
        //     labelOrdenarPor.classList.toggle('ocultar')
        // })



        function finalizarCompra() {
            let carrito = JSON.parse(localStorage.getItem("carrito"))
            carrito.innerHTML = ''

            if (!carrito || carrito.length === 0) {
                alert('Primero debes ingresar productos al carrito')
            } else {
                let total = carrito.reduce((acum, camiseta) => acum + camiseta.subtotal, 0)
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Su compra fue realizada con exito',
                    text: 'El total a pagar es $' + total,
                    showConfirmButton: true,
                    width: '400px',
                })
                limpiarCarrito()
            }
        }

        function limpiarCarrito() {
            let carritoElement = document.getElementById("carrito")
            carritoElement.innerHTML = ""
            localStorage.removeItem("carrito")
        }

        function tostada(text, duration) {
            Toastify({
                text,
                duration
            }).showToast()
        }



    })
    .catch(error => tostada(error, 1000))
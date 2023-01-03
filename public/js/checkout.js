/* 
// This is your test publishable API key.
const stripe = Stripe("pk_test_51KM9AXD6vjKKpvO4CODSAMYTydO6beDQ9DQ4D6nLJ4TyjMcdcCLbsovru7EjMSmhZztht6GvuPMG7NvsEb6oqNHU00TDPgBzGy");
STRIPE_PUBLIC_KEY_LIVE='pk_live_51KM9AXD6vjKKpvO4YWt1DmDQE57SNpBBfP9Y7rShgsrQbqZMHFd2azGh84hUOsAdHN31jg2pLro9UtN31fKidIlo00LAU8QQrq'

const button = document.querySelector('#button-text')
const itemsInCart = document.querySelectorAll('.items-in-cart')
itemsInCart.forEach(item => {
    return item
})
button.addEventListener("click", () => {
    fetch('/cart/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: [
                itemsInCart
            ]
        }),
    }).then(res => {
            if (res.ok) return res.json()
            return res.json().then(json => Promise.reject(json))
        }).then(({url}) => {
           window.location = url
           //console.log(url)
        })
    }).catch(e => {
        console.error(e.error)
    })







 */























// The items the customer wants to buy



/* const items = [{ id: '61eb603fd885be3bbe3e9f78' }];

let elements;

initialize();
checkStatus();

document
    .querySelector("#payment-form")
    .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {
    const response = await fetch("http://localhost:3000/cart/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "http://localhost:5000/" },
        body: JSON.stringify({ items }),
    });
    const { clientSecret } = await response.json();

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#87CEFA',
            colorBackground: '#ecf0f3',
            colorText: '#555',
            borderRadius: '16px'
        },
        rules: {
            '.Tab--selected': {
                boxShadow: '2px 2px 5px #00ff00'
            }
        },
        labels: 'floating'
    };
    elements = stripe.elements({ appearance, clientSecret });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // Make sure to change this to your payment completion page
            return_url: "/cart/payment-complete",
        },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message);
    } else {
        showMessage("An unexpected error occured.");
    }

    setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    if (!clientSecret) {
        return;
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
        case "succeeded":
            showMessage("Payment succeeded!");
            break;
        case "processing":
            showMessage("Your payment is processing.");
            break;
        case "requires_payment_method":
            showMessage("Your payment was not successful, please try again.");
            break;
        default:
            showMessage("Something went wrong.");
            break;
    }
}

// ------- UI helpers -------

function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageText.textContent = "";
    }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
} */
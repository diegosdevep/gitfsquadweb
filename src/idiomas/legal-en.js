export const privacidad = {
  etiqueta: "Privacy",
  titulo: "Privacy policy",
  intro:
    "GiftSquad, developed by {autor}, respects your privacy. This policy explains what data we collect, how we use it, who we share it with and what your rights are.",
  secciones: [
    {
      titulo: "Data we collect",
      bloques: [
        {
          tipo: "p",
          texto:
            "We only collect the data needed for the app to work and for you to coordinate gifts with your group.",
        },
        {
          tipo: "tabla",
          filas: [
            { clave: "Name and email", valor: "To create your account. Provided by Google or Apple when you sign in." },
            { clave: "Profile photo", valor: "Optional. Shown on your profile and in the groups you belong to." },
            { clave: "Your lists", valor: "The items you add: name, link, price and product image." },
            { clave: "Groups", valor: "The groups you create and the people you invite to each one." },
            { clave: "Reservations", valor: "Which gifts you reserved. Never visible to the recipient." },
            { clave: "Device token", valor: "To send you notifications when something happens in your groups." },
          ],
        },
        {
          tipo: "p",
          texto:
            "We never ask for or store your password: sign-in is handled by Google or Apple. We do not ask for card details either, because nothing is purchased inside the app.",
        },
      ],
    },
    {
      titulo: "How we use your data",
      bloques: [
        {
          tipo: "lista",
          items: [
            "**Authentication:** to verify your identity and give you access to your account.",
            "**Coordination:** to show your lists to the groups you chose and record which items are already reserved.",
            "**Notifications:** to let you know when someone adds you to a group or when a Secret Santa draw runs.",
            "**History:** to keep a record of what was given and when, so nobody repeats it the following year.",
          ],
        },
        {
          tipo: "p",
          texto:
            "We do not sell, rent or share your data with third parties for advertising or commercial purposes. The app has no ads.",
        },
      ],
    },
    {
      titulo: "Who can see what",
      bloques: [
        {
          tipo: "p",
          texto:
            "This is the core of GiftSquad, and it is enforced by the server's security rules, not just by the app's interface:",
        },
        {
          tipo: "lista",
          items: [
            "Whoever receives a gift **cannot access** the identity of the person who reserved it, not even by querying the raw data.",
            "Who delivered each gift in the history is stored in a separate collection, readable only by that same person.",
            "In Secret Santa, each participant can only read their own assignment. Not even the event organiser sees the full draw.",
            "Private notes on an item are visible only to the list owner.",
          ],
        },
      ],
    },
    {
      titulo: "Third parties involved",
      bloques: [
        {
          tipo: "p",
          texto: "GiftSquad relies on the following external services, each with its own privacy policy:",
        },
        {
          tipo: "tabla",
          filas: [
            {
              clave: "Firebase / Google",
              valor:
                "Authentication, Firestore database, image storage and notification delivery. Data hosted on Google servers.",
            },
            { clave: "Apple", valor: "Sign in with Apple and app distribution through the App Store." },
            {
              clave: "Online stores",
              valor:
                "When you paste a product link, we request that page to retrieve the title, image and price.",
            },
          ],
        },
        { tipo: "p", texto: "Each one receives only the data strictly necessary to perform its function." },
      ],
    },
    {
      titulo: "Store links and prices",
      bloques: [
        {
          tipo: "p",
          texto:
            "The request the app makes to the store is **anonymous**: none of your data is sent, not your account, not your location. The store only sees a request for the product page.",
        },
        {
          tipo: "nota",
          texto:
            "Prices shown in the app are indicative. They come from the store at the moment you add the link and may vary depending on the delivery country and applicable taxes. The store's price at the time of purchase is always the one that counts.",
        },
      ],
    },
    {
      titulo: "Retention and deletion",
      bloques: [
        {
          tipo: "p",
          texto:
            "Your data is kept for as long as you have an active account. You can request deletion of your account and all its content by writing to {email}.",
        },
        {
          tipo: "p",
          texto:
            "Deletion covers your lists and items, your groups, your reservations, your private notes, any images you uploaded and your authentication user. It is permanent and irreversible.",
        },
      ],
    },
    {
      titulo: "International data transfers",
      bloques: [
        {
          tipo: "p",
          texto:
            "Your data is stored on Google (Firebase) servers located outside your country of residence, mainly in the United States. By using the app you consent to that transfer.",
        },
      ],
    },
    {
      titulo: "Security",
      bloques: [
        {
          tipo: "lista",
          items: [
            "All communication between the app and Firebase is encrypted with TLS.",
            "Firestore security rules guarantee that each user can only read and modify what belongs to them.",
            "Firebase App Check (App Attest in production) prevents any client other than the legitimate app from reaching the data.",
            "The Secret Santa draw runs on the server, so the result cannot be deduced from the device.",
          ],
        },
      ],
    },
    {
      titulo: "Children's privacy",
      bloques: [
        {
          tipo: "p",
          texto:
            "GiftSquad is not directed at people under 13. We do not knowingly collect data from minors. If you believe a minor registered an account, write to {email} and we will delete it.",
        },
      ],
    },
    {
      titulo: "Changes to this policy",
      bloques: [
        {
          tipo: "p",
          texto:
            "We may update this policy when the app changes or legal requirements do. Significant changes are announced inside the app, and the last updated date is always visible at the top of this page.",
        },
      ],
    },
    {
      titulo: "Contact",
      bloques: [
        {
          tipo: "p",
          texto:
            "For privacy enquiries or to exercise your rights of access, rectification or deletion: {email}",
        },
      ],
    },
  ],
};

export const terminos = {
  etiqueta: "Terms",
  titulo: "Terms and conditions",
  intro:
    "By downloading, installing or using GiftSquad, you accept these terms and conditions. Please read them carefully before using the application.",
  secciones: [
    {
      titulo: "Description of the service",
      bloques: [
        { tipo: "p", texto: "GiftSquad is a free iOS app that lets you:" },
        {
          tipo: "lista",
          items: [
            "Build gift lists by adding links from online stores.",
            "Share those lists with family, friend or work groups.",
            "Reserve a gift anonymously, so nobody repeats it and the recipient does not know who reserved it.",
            "Organise a Secret Santa with an automatic draw and exclusions.",
            "Receive alerts when there is something new in their groups.",
          ],
        },
        {
          tipo: "nota",
          texto:
            "GiftSquad **does not sell products or process payments**. It is a coordination tool: the purchase always happens at the store you choose, under its own terms.",
        },
      ],
    },
    {
      titulo: "Eligibility",
      bloques: [
        { tipo: "p", texto: "To use GiftSquad you must:" },
        {
          tipo: "lista",
          items: [
            "Be at least 13 years old.",
            "Provide truthful and up-to-date registration information.",
            "Have a compatible iOS device and an internet connection.",
          ],
        },
      ],
    },
    {
      titulo: "Your account",
      bloques: [
        {
          tipo: "p",
          texto:
            "Access is through your Google or Apple account. You are responsible for the activity that takes place from your account and for keeping access to that provider secure.",
        },
        { tipo: "p", texto: "If you suspect your account has been compromised, write to {email}." },
      ],
    },
    {
      titulo: "Acceptable use",
      bloques: [
        { tipo: "p", texto: "You may not use GiftSquad to:" },
        {
          tipo: "lista",
          items: [
            "Impersonate another person.",
            "Add people to a group in order to harass them.",
            "Upload illegal or offensive content, or content that infringes third-party rights.",
            "Attempt to access other users' accounts, lists or reservations.",
            "Attempt to deduce by technical means who reserved a gift from your own list.",
            "Carry out any activity contrary to applicable law.",
          ],
        },
        { tipo: "p", texto: "We reserve the right to suspend or delete accounts that breach these conditions." },
      ],
    },
    {
      titulo: "Content you upload",
      bloques: [
        {
          tipo: "p",
          texto:
            "When you add items, text or images you keep ownership of that content, and grant us a limited licence to store it and show it to the groups you selected.",
        },
        {
          tipo: "p",
          texto:
            "You declare that you have the right to use the content you upload and that it does not infringe third-party rights.",
        },
      ],
    },
    {
      titulo: "Links, prices and third-party brands",
      bloques: [
        {
          tipo: "p",
          texto:
            "The prices shown in the app are a reference taken automatically from the store at the time the link was added. They may be out of date or differ depending on your delivery country and applicable taxes.",
        },
        {
          tipo: "p",
          texto:
            "Store and product names belong to their respective owners. GiftSquad is not associated with, sponsored by or endorsed by any of them, nor is it party to the commercial relationship between you and the store.",
        },
      ],
    },
    {
      titulo: "Service availability",
      bloques: [
        {
          tipo: "p",
          texto:
            "GiftSquad depends on third-party services (Firebase, Apple) and on your device's connectivity. We do not guarantee uninterrupted availability. Interruptions may occur due to maintenance, updates or factors beyond our control.",
        },
      ],
    },
    {
      titulo: "Intellectual property",
      bloques: [
        {
          tipo: "p",
          texto:
            "GiftSquad and all its content (design, code, brand, text and images) are the property of {autor}. You may not copy, modify, distribute or create derivative works without express written authorisation.",
        },
      ],
    },
    {
      titulo: "Limitation of liability",
      bloques: [
        { tipo: "p", texto: "To the maximum extent permitted by law:" },
        {
          tipo: "lista",
          items: [
            "GiftSquad is provided «as is», without warranties of any kind.",
            "We are not responsible for the quality, delivery or availability of the products listed.",
            "We are not responsible for agreements between users regarding gifts, which happen outside the app.",
            "We are not responsible for direct, indirect or incidental damages arising from the use or inability to use the app.",
          ],
        },
      ],
    },
    {
      titulo: "Account deletion",
      bloques: [
        {
          tipo: "p",
          texto:
            "You can request deletion of your account and all your data at any time by writing to {email}. Deletion is permanent and irreversible: once done, we cannot recover any associated data.",
        },
      ],
    },
    {
      titulo: "Apple licence",
      bloques: [
        {
          tipo: "p",
          texto:
            "This agreement supplements, and does not replace, the terms of Apple's Standard Licensed Application End User License Agreement.",
        },
      ],
    },
    {
      titulo: "Modifications",
      bloques: [
        {
          tipo: "p",
          texto:
            "We may modify these terms at any time. Significant changes are announced inside the app. Continued use of GiftSquad after changes are published implies acceptance.",
        },
      ],
    },
    {
      titulo: "Governing law",
      bloques: [
        {
          tipo: "p",
          texto:
            "These terms are governed by the laws of the Argentine Republic, with jurisdiction in the Autonomous City of Buenos Aires.",
        },
      ],
    },
    {
      titulo: "Contact",
      bloques: [{ tipo: "p", texto: "For enquiries about these terms: {email}" }],
    },
  ],
};

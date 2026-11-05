# Firebase setup for SDS Delivery

The app is configured for Firebase project `sdsdelivery-7d4b2`. Cloud Firestore is Standard edition in `eur3`. Firestore security rules have been deployed. `.env.local` contains the local Firebase Web app configuration and is excluded from Git.

## 1. Enable staff sign-in

In Firebase Console, open **Authentication -> Sign-in method** and enable **Email/Password**. Under **Authentication -> Settings -> Authorized domains**, make sure `localhost` is listed for local development.

## 2. Create the first owner account

In **Authentication -> Users**, select **Add user** and create an account for the SDS owner. Keep the password private. Copy the account's UID.

## 3. Assign the owner role

In **Firestore Database -> Data**, create a `staff` collection if needed. Add a document whose document ID is the new account UID. Add these fields as strings:

| Field | Value |
| --- | --- |
| `name` | Owner's display name |
| `email` | Same email used for the Auth account |
| `role` | `owner` |

The `staff` collection is intentionally read-only to app users. Create or edit staff profiles through the Firebase Console as the project administrator.

## 4. Sign in locally

From the repository folder, run `npm run dev`, then open `http://localhost:3000/stafflogin`. Sign in with the owner account created above. The app reads the matching `staff/{uid}` document to determine the role. Staff sign-in is not linked from the public login or registration screens.

## 5. Add more staff and riders

Create each staff account under **Authentication -> Users**. For an operations manager, add a `staff/{uid}` document with `name`, `email`, and `role: manager`. For a rider, first create the rider record in the admin console, then add `staff/{uid}` with `name`, `email`, `role: rider`, and `riderId` set to that rider record's document ID.

Customers can submit requests without accounts. Only authorized staff can read and process requests. Payment details, payment confirmation, and tracking updates are handled offline by SDS staff. The old browser demo seed data is not imported into Firestore.

## 6. Deploy the latest Firestore rules

The owner-only operational data reset requires the updated rules that permit owners to delete order, rider, and payout records. To publish the rules from the repository folder, run:

```bash
npx -y firebase-tools@latest deploy --only firestore:rules --project sdsdelivery-7d4b2
```

The reset action appears in **Admin → Settings** for the owner account. It requires typing `DELETE` and removes all documents in `orders`, `riders`, and `payouts`; it keeps `staff` and `settings`.

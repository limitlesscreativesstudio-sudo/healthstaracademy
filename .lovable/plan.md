## Investigation report: production login 400

**No code was changed and nothing was deployed.**

### 1) Does “Create Instructor / Admin Account” create a real Auth user?

**Yes, the `/portal/teach/create-account` flow does attempt to create a real Auth user.**

Code path:

```text
/portal/teach/login
  -> “Create Instructor / Admin Account” link
  -> /portal/teach/create-account
  -> CreateAccount.handleCreate()
  -> auth.signUp({ email, password, options })
```

What it sends:

- Email: `email.trim().toLowerCase()`
- Password: the raw password React state value
- Metadata: `full_name` and `requested_role`
- Redirect: `/portal/teach/login`

It does **not** manually insert only a profile row. Profile and role rows are handled by the backend trigger after a real Auth user is inserted.

However, I found two important issues:

- The button label says **“Create Instructor / Admin Account”**, but the form only offers the `instructor` role. It does **not** create an admin account.
- The separate invite page, `/portal/teach/invite` or `/portal/accept-invite`, is still a mock/simulated flow. It can show “account created,” but its real `signUp` / profile / invite update calls are commented out. Anyone using that invite flow would not get a real password login account.

### 2) Is the password altered on creation vs login?

**I did not find code that hashes, trims, lowercases, or otherwise changes the password before sending it to Auth.**

Creation path:

```text
CreateAccount.tsx
  password state
  -> auth.signUp({ email: cleanEmail, password })
```

Login path:

```text
PortalLogin.tsx
  password state
  -> login(email.trim(), password)
  -> AuthContext.login()
  -> auth.signInWithPassword({ email: trimEmail, password: loginPassword })
```

The only normalization is on the email address. Password is passed through as typed.

One minor note: login checks `!password.trim()` only to reject a blank/all-space password, but it still sends the original `password` value, not the trimmed value.

### 3) Is email confirmation causing this?

**For the accounts currently in Auth, email confirmation is not the cause.**

Backend records show:

- Existing password users are confirmed.
- There are currently **0 unconfirmed Auth users**.
- Existing password users have `has_password = true`.

Also, the app has a separate error branch for “email not confirmed.” The error you’re seeing is mapped from an Auth `invalid login credentials` response, not a confirmation-required response.

### 4) Where does the HTTP 400 originate?

The 400 originates at the Auth password-token endpoint before the app queries profiles or roles:

```text
PortalLogin.handleLogin()
  -> AuthContext.login()
  -> auth.signInWithPassword()
  -> POST /auth/v1/token?grant_type=password
  -> Auth returns HTTP 400 invalid login credentials
  -> AuthContext maps that to:
     “Incorrect email or password. Please try again.”
```

So this is a true credential failure: the email/password pair does not match a real password-based Auth user.

### Backend data findings

Only **3 Auth users** currently exist.

The self-register allowlist contains:

```text
healthstaracademy01@gmail.com
limitlesscreativesstudio@gmail.com
knelson4677@gmail.com
agnesnamitala@gmail.com
```

But only these two allowlisted emails currently exist as Auth users:

```text
healthstaracademy01@gmail.com
limitlesscreativesstudio@gmail.com
```

Both have:

```text
has_password = true
email confirmed = true
roles = student + instructor
```

These allowlisted emails do **not** currently exist as Auth users:

```text
knelson4677@gmail.com
agnesnamitala@gmail.com
```

If either of those emails is being used to log in after “creating an account,” the 400 is expected because there is no real Auth user for that email.

There is also one Google-only user with no password hash. Password login will fail for any user that exists only through Google/invite and has not set a password.

## Most likely root cause

The production 400 is not caused by the preview proxy and not caused by password trimming in the visible code.

The most likely causes are:

1. The account being tested does **not actually exist** in Auth, despite the UI flow seeming successful.
2. The user used the simulated invite flow, which does not create a real Auth user or password.
3. The user exists through Google/invite only and has no password set.
4. The tested email already existed, and a repeated signup did not change its password; login then fails if the typed password is not the real stored password.

## Recommended fix

### Immediate operational fix

- For the exact email being tested, verify whether it exists in Auth.
- If it does not exist, create it through the real `/portal/teach/create-account` flow or create/reset it from the backend admin tools.
- If it exists but the password is unknown, use the password reset flow instead of repeated signup attempts.
- If it is a Google-only/invited account, set a password through password reset before using email/password login.

### Code fix I recommend next

1. Make the invite flow real or hide it until implemented.
   - The current invite page can falsely imply an account was created.
   - It should validate real invite records and create/set the Auth user password.

2. Rename the public signup CTA.
   - Current label: “Create Instructor / Admin Account”
   - More accurate: “Create Instructor Account”
   - Admin account creation should not be public self-registration.

3. Improve signup error messaging.
   - Clearly distinguish:
     - account created, check email
     - account already exists, reset password
     - signup blocked/not completed
     - email not authorized

4. Add a backend-backed admin creation/reset path for staff accounts.
   - Admin-only flow creates real Auth users, assigns roles, and optionally sends a password setup email.
   - This avoids repeated public signup confusion.

5. Keep the login password handling unchanged.
   - The current login path correctly sends the raw password.

<presentation-actions>
<presentation-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</presentation-link>
</presentation-actions>
# Create instructor test login

Set up `healthstaracademy01@gmail.com` as a ready-to-use instructor account with the password you provided, enrolled in every course so you can start testing the portal immediately.

## What will be done

1. **Pre-authorize the email as an instructor** — add it to the instructor invite list so the account-creation trigger grants the instructor role automatically (roles stay in the separate roles table, never on the profile).
2. **Create the account** — create the user with the given email and password, email pre-confirmed so no verification link is needed. If the account already exists, its password is reset to the provided value instead of erroring.
3. **Grant the instructor role** — confirm the instructor role row exists (belt-and-suspenders in case the account already existed before the invite row).
4. **Enroll in all courses** — add a teacher-level enrollment row for every existing course, so both sandboxes and any other course show up in the portal.
5. **Set the display name** — profile name set to "Health Star Academy Instructor" (tell me if you'd prefer a different name).
6. **Verify** — sign in end-to-end against the running app, confirm it lands on the instructor portal and that all courses appear on the dashboard, then report the result.

## Technical notes

- User creation and password set run through the admin auth API from a server-side script; no schema migration is needed.
- Instructor authorization uses the existing `instructor_invites` + `handle_new_user` path, plus a direct `user_roles` insert for idempotency.
- Course access uses `enrollments` rows with role `teacher` for each row in `courses`.
- Password will be stored only in the auth system, never in project files.

## Security note

Since this login is for testing, I recommend changing the password after testing wraps, or before real student data exists in the portal.

import sql from "../db.js"
import { nameRegex, emailRegex, passwordRegex } from "../Regex.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { JWTsecret } from "../middleware/verifyToken.js"

export const postRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body

    const sameEmail = await sql`
    SELECT email
    FROM users
    WHERE email = ${email}`

    if (sameEmail.length !== 0) {
      return res
        .status(401)
        .json({ error: "Email is already assosiated with a different account" })
    }

    if (
      !nameRegex.test(firstName) ||
      !nameRegex.test(lastName) ||
      !emailRegex.test(email) ||
      !passwordRegex.test(password)
    ) {
      return res.status(401).json({ error: "Incorrect registration data" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = await sql`
      INSERT INTO users (first_name, last_name, email, password)
      VALUES (${firstName}, ${lastName}, ${email}, ${hashedPassword})
      RETURNING id`

    const token = jwt.sign({ userId: userId[0].id }, JWTsecret)
    res.cookie("user", token, {
      httpOnly: true,
      domain: "localhost",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 1,
    })

    const registeredUser = await sql`
    SELECT * 
    FROM users
    WHERE email = ${email}`

    return res.json(registeredUser[0])
  } catch (error) {
    console.error("Error is: ", error)
    return res.status(500).json({ error: "Error when registering" })
  }
}

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    const storedPassword = await sql`
    SELECT password
    FROM users
    WHERE email = ${email}`

    if (!Object.values(storedPassword).length) {
      return res.status(401).json({ error: "Email doesn't exist" })
    }

    bcrypt.compare(
      password,
      storedPassword[0].password,
      async (err, result) => {
        if (err) {
          console.error("Error is: ", err)
          return res.status(500).json({ error: "Error comparing passwords" })
        } else if (result) {
          const user = await sql`
      SELECT * 
      FROM users
      WHERE email = ${email}`

          const token = jwt.sign({ userId: user[0].id }, JWTsecret)
          res.cookie("user", token, {
            httpOnly: true,
            domain: "localhost",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 1,
          })

          return res.json(user[0])
        } else {
          return res.status(401).json({ error: "Invalid password" })
        }
      }
    )
  } catch (error) {
    console.error("Error is: ", error)
    return res.status(500).json({ error: "Error when loggin in" })
  }
}

export const postCompleteHabit = async (req, res) => {
  try {
    const { userId, habitId, date } = req.body

    await sql`
    INSERT INTO completed_habits(user_id, habit_id, completion_date)
    VALUES (${userId}, ${habitId}, ${date})`
    return res.json({ success: "Successfully added new habit" })
  } catch (error) {
    console.error("Error is: ", error)
    return res.status(500).json({ error: "Error when completing habit" })
  }
}

export const postRemoveHabit = async (req, res) => {
  try {
    const { userId, habitId } = req.body

    await sql`
  DELETE FROM completed_habits
  WHERE user_id = ${userId} AND habit_id = ${habitId}`
    return res.json({ success: "Successfully removed habit" })
  } catch (error) {
    console.error("Error is: ", error)
    return res.status(500).json({ error: "Error when removing habit" })
  }
}

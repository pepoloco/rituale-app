import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  List,
  ListItemButton,
  ListItemText,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../Store"
import {
  changeColorTheme,
  changeLanguage,
} from "../features/settings/settingsSlice"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { login, logout } from "../features/session/sessionSlice"
import { clearHabits } from "../features/completedHabits/completedHabitsSlice"
import { useState } from "react"
import { emailRegex, nameRegex, passwordRegex } from "../Regex"
import { languages } from "../constants"

const Settings = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.session.user)
  const colorTheme = useSelector(
    (state: RootState) => state.settings.colorTheme
  )
  const language = useSelector((state: RootState) => state.settings.language)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleThemeChange = () => {
    axios
      .patch(
        `http://localhost:5432/user-settings/change-theme/${user?.id}`,
        JSON.stringify({ theme: colorTheme === "dark" ? "light" : "dark" }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((response) => {
        dispatch(changeColorTheme(response.data.theme))
      })
  }

  const handleDeleteUser = () => {
    axios
      .delete(`http://localhost:5432/delete-user/${user?.id}`, {
        withCredentials: true,
      })
      .then(() => {
        dispatch(logout())
        dispatch(clearHabits())
        navigate("/login")
      })
  }

  const [userData, setUserData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const handleUserDataChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    axios
      .patch(
        `http://localhost:5432/change-user-data/${user?.id}`,
        JSON.stringify(userData),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log("res data", response.data)
        dispatch(login({ ...user, ...response.data }))
      })
  }

  const handleLanguageChange = (lang: string) => {
    axios.patch(
      `http://localhost:5432/user-settings/change-language/${user?.id}`,
      JSON.stringify({ language: lang }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    )
  }

  const [changedFields, setChangedFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  })

  return (
    <Box>
      <Typography
        component="h2"
        sx={{ fontSize: 50 }}
      >
        {user?.first_name}'s settings
      </Typography>
      <form onSubmit={(e) => handleUserDataChange(e)}>
        <Typography
          component="h3"
          sx={{ fontSize: 35 }}
        >
          Change credentials
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ flexDirection: "row" }}>
            <TextField
              label="First Name"
              sx={{ mb: 1 }}
              value={userData.firstName}
              onChange={(e) => {
                if (!changedFields.firstName) {
                  setChangedFields({ ...changedFields, firstName: true })
                }
                const capitalizedFirstName =
                  e.target.value.charAt(0).toUpperCase() +
                  e.target.value.slice(1).toLowerCase()

                setUserData({ ...userData, firstName: capitalizedFirstName })
              }}
              error={!nameRegex.test(userData.firstName)}
            />
            <TextField
              label="Last Name"
              sx={{ mb: 1 }}
              value={userData.lastName}
              onChange={(e) => {
                if (!changedFields.lastName) {
                  setChangedFields({ ...changedFields, lastName: true })
                }
                const capitalizedLastName =
                  e.target.value.charAt(0).toUpperCase() +
                  e.target.value.slice(1).toLowerCase()

                setUserData({ ...userData, lastName: capitalizedLastName })
              }}
              error={!nameRegex.test(userData.lastName)}
            />
          </Box>
          <TextField
            label="email"
            type="email"
            sx={{ mb: 1 }}
            value={userData.email}
            onChange={(e) => {
              if (!changedFields.email) {
                setChangedFields({ ...changedFields, email: true })
              }
              setUserData({ ...userData, email: e.target.value })
            }}
            error={!emailRegex.test(userData.email)}
          />
          <TextField
            label="Old password"
            value={userData.oldPassword}
            onChange={(e) => {
              if (!changedFields.oldPassword) {
                setChangedFields({ ...changedFields, oldPassword: true })
              }
              setUserData({ ...userData, oldPassword: e.target.value })
            }}
            helperText="Must be at least 8 characters long, have 1 lowercase, 1 uppercase letter and 1 number"
          />
          <TextField
            label="New password"
            value={userData.newPassword}
            onChange={(e) => {
              if (!changedFields.newPassword) {
                setChangedFields({ ...changedFields, newPassword: true })
              }
              setUserData({ ...userData, newPassword: e.target.value })
            }}
          />
          <TextField
            label="Confirm new password"
            value={userData.confirmNewPassword}
            onChange={(e) => {
              if (!changedFields.confirmNewPassword) {
                setChangedFields({ ...changedFields, confirmNewPassword: true })
              }
              setUserData({ ...userData, confirmNewPassword: e.target.value })
            }}
          />
        </Box>
        <Button
          type="submit"
          disabled={
            !nameRegex.test(userData.firstName) ||
            !nameRegex.test(userData.lastName) ||
            !emailRegex.test(userData.email) ||
            (!passwordRegex.test(userData.oldPassword) &&
              changedFields.oldPassword) ||
            (!passwordRegex.test(userData.newPassword) &&
              changedFields.newPassword) ||
            (!passwordRegex.test(userData.confirmNewPassword) &&
              changedFields.confirmNewPassword)
          }
        >
          save changes
        </Button>
      </form>
      <br />
      <br />

      <Button onClick={() => setIsDialogOpen(true)}>change language</Button>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        aria-labelledby="langauge dialog"
      >
        <DialogTitle>Change Language</DialogTitle>
        <DialogContent>
          <List>
            {languages.map((lang, index) => (
              <Box key={index}>
                <ListItemButton
                  selected={lang.shortHand === language}
                  onClick={() => {
                    dispatch(changeLanguage(lang.shortHand))
                    handleLanguageChange(lang.shortHand)
                  }}
                >
                  <ListItemText primary={lang.fullName} />
                </ListItemButton>
                {index !== 4 ? <Divider /> : ""}
              </Box>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <FormGroup sx={{ display: "block" }}>
        <FormControlLabel
          control={<Switch />}
          checked={colorTheme === "dark"}
          label="Dark Mode"
          labelPlacement="start"
          onChange={handleThemeChange}
        />
      </FormGroup>
      <Typography
        component="h3"
        sx={{ color: "red", fontWeight: "bold", fontSize: 35 }}
      >
        Danger Zone
      </Typography>
      <Button onDoubleClick={handleDeleteUser}>delete profile</Button>
    </Box>
  )
}

export default Settings

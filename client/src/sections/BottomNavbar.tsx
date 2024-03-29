import { BottomNavigation, BottomNavigationAction } from "@mui/material"
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement"
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import HomeIcon from "@mui/icons-material/Home"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../Store"
import { changeLocation } from "../features/bottomNav/bottomNavSlice"
import { useEffect } from "react"

const BottomNavbar = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.session.user)
  const bottomNavLocation = useSelector(
    (state: RootState) => state.bottomNav.value
  )
  const dispatch = useDispatch()

  const TLD = "http://localhost:5173"

  useEffect(() => {
    window.location.href === `${TLD}/`
      ? dispatch(changeLocation(0))
      : window.location.href === `${TLD}/habits`
      ? dispatch(changeLocation(1))
      : window.location.href === `${TLD}/tips`
      ? dispatch(changeLocation(2))
      : window.location.href === `${TLD}/profile`
      ? dispatch(changeLocation(3))
      : window.location.href === `${TLD}/login`
      ? dispatch(changeLocation(3))
      : window.location.href === `${TLD}/forgot-password`
      ? dispatch(changeLocation(3))
      : window.location.href === `${TLD}/register`
      ? dispatch(changeLocation(3))
      : window.location.href === `${TLD}/settings`
      ? dispatch(changeLocation(3))
      : navigate("/not-found")
  }, [navigate, dispatch])

  return (
    <BottomNavigation
      value={bottomNavLocation}
      onChange={(_e, newValue) => {
        dispatch(changeLocation(newValue))
      }}
      sx={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        display: { xs: "flex" },
        height: 50,
      }}
    >
      <BottomNavigationAction
        label="Home"
        icon={<HomeIcon />}
        onClick={() => navigate("/")}
      />

      <BottomNavigationAction
        label="Habits"
        icon={<SelfImprovementIcon />}
        onClick={() => navigate("/habits")}
      />
      <BottomNavigationAction
        label="Tips"
        icon={<TipsAndUpdatesIcon />}
        onClick={() => navigate("/tips")}
      />
      <BottomNavigationAction
        label="Profile"
        icon={<AccountCircleIcon />}
        onClick={() => navigate(user ? "/profile" : "/login")}
      />
    </BottomNavigation>
  )
}

export default BottomNavbar

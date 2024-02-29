import React from 'react'
import CreateCollection from '../../Components/CreateCollection/CreateCollection'
import ShowMyPurchases from '../../Components/ShowMyPurchases/ShowMyPurchases'
import Style from "./MyAccount.module.css"

const MyAccount = () => {
  return (
    <div className={Style.myAccount}>
        <CreateCollection></CreateCollection>
        <ShowMyPurchases></ShowMyPurchases>
    </div>
  )
}

export default MyAccount
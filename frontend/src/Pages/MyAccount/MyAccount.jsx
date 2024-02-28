import React from 'react'
import CreateCollection from '../../Components/CreateCollection/CreateCollection'
import ShowMyPurchases from '../../Components/ShowMyPurchases/ShowMyPurchases'
const MyAccount = () => {
  return (
    <div>MyAccount
        <CreateCollection></CreateCollection>
        <ShowMyPurchases></ShowMyPurchases>
    </div>
  )
}

export default MyAccount
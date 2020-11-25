export default `
contract AEBTG =
  record state = {
    owner: address, 
    total_supply: int,
    map_balances: map(address, int)
    }

  stateful entrypoint init() = {
    owner = Call.caller,
    total_supply = 0,
    map_balances = {}
    }

  entrypoint total_supply() : int =
    state.total_supply

  entrypoint balance_of(who: address) : int =
    Map.lookup_default(who, state.map_balances, 0)

  stateful entrypoint transfer(to: address, value: int) =
    transferFrom(Call.caller, to, value)


  stateful function transferFrom(from: address, to: address, value: int) =
    require(value > 0, "Value is sub zero")
    require(value =< balance_of(from), "Not enough balance")
      
    put(state{
      map_balances[from] = balance_of(from) - value,
      map_balances[to] = balance_of(to) + value })

  stateful entrypoint mint(account: address, value: int) =
    only_owner()

    put(state{total_supply = state.total_supply + value,
          map_balances[account] = balance_of(account) + value})

  stateful entrypoint burn(value: int) =
    require(balance_of(Call.caller) >= value, "Burned amount is less than account balance")

    put(state{total_supply = state.total_supply - value,
          map_balances[Call.caller] = balance_of(Call.caller) - value})
    value // used to return

  private function only_owner() =
      require(Call.caller == state.owner, "Only owner can mint!")
`;

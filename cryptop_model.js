//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//
model = {
	
  config: {},
  data : {},
  ui   : {},
  portfolio: {},

  // Demande au modèle de se mettre à jour en fonction des données qu'on
  // lui présente.
  // l'argument data est un objet confectionné dans les actions.
  // Les propriétés de data apportent les modifications à faire sur le modèle.
  samPresent(data) {

    switch (data.do) {

      case 'init': {
        Object.assign(this, data.config);
        const conf = this.config;
        conf.targets.list = mergeUnique([conf.targets.wished], conf.targets.list).sort();
        const isOnline = conf.dataMode == 'online';
        conf.targets.active = isOnline ? conf.targets.wished : this.data.offline.live.target;
        this.hasChanged.currencies = true;
        if (conf.debug) console.log('model.samPresent - init - targets.list  : ', conf.targets.list);
        if (conf.debug) console.log('model.samPresent - init - targets.active: ', conf.targets.active);

      } break;

      case 'updateCurrenciesData': {
        this.data.online = data.currenciesData;
        this.config.targets.active = data.currenciesData.live.target;
        this.hasChanged.currencies = true;
      } break;

      case 'changeDataMode': {
        this.config.dataMode = data.dataMode;
        if (data.dataMode == 'offline') {
          this.config.targets.active = this.data.offline.live.target;
          this.hasChanged.currencies = true;
        }
      } break;

      case 'changeTab': {
        switch (data.tab) {
          case 'currenciesCryptos':
            this.ui.currenciesCard.selectedTab = 'cryptos';
            break;
          case 'currenciesFiats':
            this.ui.currenciesCard.selectedTab = 'fiats';
            break;
          case 'walletPortfolio':
            this.ui.walletCard.selectedTab = 'portfolio';
            break;
          case 'walletAjouter':
            this.ui.walletCard.selectedTab = 'ajouter';
            break;
            default:
        }
      } break;

//----------------------------------------------------------- CurrenciesUI ---
      case 'sortOrder':
        const sort  = model.ui.currenciesCard.tabs[data.currency].sort;
        const column =  data.sortBy;
        this.ui.currenciesCard.tabs[data.currency].sort.column = column;
        this.ui.currenciesCard.tabs[data.currency].sort.incOrder[column] = !sort.incOrder[column];
        this.hasChanged[data.currency].sort = true;
      break;
//----------------------------------------------------------- Cryptos ---
      case 'addCurrency':
        if(state.data.coins.allCodes.includes(data.code)){
          if(state.data.coins.nullValueCodes.includes(data.code))
            delete this.config.coins[data.code];
          }
        else
          this.config.coins[data.code] = {quantity: 0  , quantityNew: ''};
        this.hasChanged.coins = true;
      break;

      case 'filtreCurrencyName':
        this.ui.currenciesCard.tabs.cryptos.filters.text = data.filtreName;
        this.hasChanged.cryptos.filter = true;
      break;

      case 'filtreCurrencyPrice':
        this.ui.currenciesCard.tabs.cryptos.filters.price = data.filtrePrice;
        this.hasChanged.cryptos.filter = true;
      break;
//----------------------------------------------------------- FiatsUI ---
      case 'addFiats':
        const targets = this.config.targets
        const index = targets.list.indexOf(data.code)
        if(index == -1 )
          this.config.targets.list.push(data.code);
        else if (data.code != targets.active)
          this.config.targets.list.splice(index, 1)
        this.hasChanged.currencies = true;
      break;
      case 'filtreMonnaie':
        this.ui.currenciesCard.tabs.fiats.filters.text = data.filtreName;
        this.hasChanged.fiats.filter = true;
      break;



//-----------------------------------------------------------  WalletUI portofolio ---
      case 'confirmerWalletPortofolio':
        const __coins = this.config.coins;
        state.data.coins.posValueCodes.map( (v,i) =>
          this.config.coins[v] = __coins[v].quantityNew != '' && !isNaN(parseInt(__coins[v].quantityNew)) && __coins[v].quantityNew >=0?
            {quantity : __coins[v].quantityNew , quantityNew : ''} : __coins[v])
      this.hasChanged.coins = true;
      break;

      case 'annulerWalletPortofolio':
        state.data.coins.posValueCodes.map( (v,i) => this.config.coins[v].quantityNew = '')
        this.hasChanged.coins = true;
      break;

      case 'changeQteWalletPortofolio':
        this.config.coins[data.code].quantityNew = data.value
        this.hasChanged.coins = true;
      break;
//--------------------------------------------------------------- WalletUI Ajouter---
      case 'confirmerWalletAjouter':
        const coins = this.config.coins;
        state.data.coins.nullValueCodes.map( (v,i) =>
          this.config.coins[v] = coins[v].quantityNew > 0 ?
            {quantity :parseInt(coins[v].quantityNew),quantityNew: ''} : coins[v])
        this.hasChanged.coins = true;
      break;

      case 'annulerWalletAjouter':
        state.data.coins.nullValueCodes.map( (v,i) => this.config.coins[v].quantityNew = '')
        this.hasChanged.coins = true;
      break;

      case 'changeQteWalletAjouter':
        this.config.coins[data.code].quantityNew = data.value
        this.hasChanged.coins = true;
      break;

//---------------------------------------------------------------
      case 'changeNbrPage':
        this.ui.currenciesCard.tabs[data.currency].pagination.rowsPerPageIndex = data.index
        this.hasChanged[data.currency].pagination = true;
      break;

      case 'currentPage++':
        const nbPages = state.ui.currenciesCard.tabs[data.currency].pagination.nbPages
        if(this.ui.currenciesCard.tabs[data.currency].pagination.currentPage<nbPages)
          this.ui.currenciesCard.tabs[data.currency].pagination.currentPage++;
        this.hasChanged.cryptos.pagination = true;
      break;

      case 'currentPage--':
        if( this.ui.currenciesCard.tabs[data.currency].pagination.currentPage>1)
          this.ui.currenciesCard.tabs[data.currency].pagination.currentPage--;
        this.hasChanged[data.currency].pagination = true;
      break;

      case 'currentPage':
        this.ui.currenciesCard.tabs[data.currency].pagination.currentPage = data.currentPage;
        this.hasChanged[data.currency].pagination = true;
      break;
      // TODO: ajoutez des cas répondant à vos actions...


      default:
        console.error(`model.samPresent(), unknown do: '${data.do}' `);
    }
    // Demande à l'état de l'application de prendre en compte la modification
    // du modèle
    state.samUpdate(this);
  }
};

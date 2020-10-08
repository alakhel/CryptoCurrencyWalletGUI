
//------------------------------------------------------------------ Actions ---
// Actions appelées dans le code HTML quand des événements surviennent
//
actions = {

  //------------------------------- Initialisation et chargement des données ---

  async initAndGo(initialConfig) {
    console.log('initAndGo: ', initialConfig);

    if (initialConfig.config.dataMode == 'online') {
      const params = {
        target : initialConfig.config.targets.wished,
        debug  : initialConfig.config.debug,
      };
      let coinlayerData = await coinlayerRequest(params);
      if (coinlayerData.success) {
        initialConfig.data.online = coinlayerData;
      } else {
        console.log('initAndGo: Données en ligne indisponibles');
        console.log('initAndGo: BASCULEMENT EN MODE HORS-LIGNE');
        initialConfig.config.dataMode = 'offline';
      }
    }
  model.samPresent({do:'init', config:initialConfig});
  },

  reinit(data) {
    const initialConfigName =  data.e.target.value;
    configsSelected = initialConfigName;
    actions.initAndGo(configs[initialConfigName]);
  },

  async updateOnlineCurrenciesData(data) {
    const params = {
      debug  : data.debug,
      target : data.target,
    };
    let coinlayerData = await coinlayerRequest(params);
    let __coinlayerData = coinlayerData.live
    if (__coinlayerData.success) {
      model.samPresent({do:'updateCurrenciesData', currenciesData: coinlayerData});
    } else {
      console.log('updateOnlineCurrenciesData: Données en ligne indisponibles');
      console.log('updateOnlineCurrenciesData: BASCULEMENT EN MODE HORS-LIGNE');
      model.samPresent({do:'changeDataMode', dataMode:'offline'});
    }
  },

  //----------------------------------------------------------- CurrenciesUI ---

  // TODO: ajoutez vos fonctions...
  changeNbrPage(data){
    model.samPresent({do : 'changeNbrPage', index : data.e.target.value, currency : data.currency});
  },
  filtreCurrencyName(data)
  {
  const filtre = data.e.target.value;
   model.samPresent({do: 'filtreCurrencyName', filtreName : filtre})
  },
  filtreCurrencyPrice(data)
  {
  const filtre = data.e.target.value
   model.samPresent({do: 'filtreCurrencyPrice', filtrePrice : filtre})
  },
  filtreMonnaie(data)
  {
  const filtre = data.e.target.value;
   model.samPresent({do: 'filtreMonnaie', filtreName : filtre})
  },

  currentPagePlus(data){
    model.samPresent({do: 'currentPage++', currency : data.currency})
  },

  currentPageMoins(data){
    model.samPresent({do: 'currentPage--',currency : data.currency})
  },
  currentPage(data){
    model.samPresent({do: 'currentPage',currency : data.currency, currentPage : data.value})
  },

  sortOrder(data){
    model.samPresent({do: 'sortOrder', sortBy: data.id, currency:data.currency})
  },
  //----------------------------------------------- CurrenciesUI et WalletUI ---
  changeTab(data) {
    model.samPresent({do:'changeTab', ...data});
  },
  addCurrency(data)
  {
   code = data.code

   model.samPresent({do: 'addCurrency', code : code})
  },

  addFiats(data)
  {
   code = data.code
   model.samPresent({do: 'addFiats', code : code})
  },

  //-----------------------------------------------------------  WalletUI portofolio ---

  // TODO: ajoutez vos fonctions... actions.confirmerWalletPortofolio

changeQteWalletPortofolio(data){
  const value = data.e.target.value
  const index = data.index
  const code = data.code

  model.samPresent({do: 'changeQteWalletPortofolio', value : value, code : code})
},
confirmerWalletPortofolio(){

  model.samPresent({do: 'confirmerWalletPortofolio'})
},
annulerWalletPortofolio(){

  model.samPresent({do: 'annulerWalletPortofolio'})
},

  //--------------------------------------------------------------- WalletUI Ajouter---

  // TODO: ajoutez vos fonctions...
  changeQteWalletAjouter(data){
    const value = data.e.target.value
    const index = data.index
    const code = data.code

    model.samPresent({do: 'changeQteWalletAjouter', value : value, code : code})
  },
  confirmerWalletAjouter(){

    model.samPresent({do: 'confirmerWalletAjouter'})
  },
  annulerWalletAjouter(){
    model.samPresent({do: 'annulerWalletAjouter'})
  },
  //---------------------------------------------------------- PreferencesUI ---

  changeTarget(data) {
    data.target = data.e.target.value;
    delete data.e;
    this.updateOnlineCurrenciesData(data)
  },

  changeDataMode(data) {
    data.dataMode = data.e.target.value;
    delete data.e;
    if (data.dataMode == 'online') {
      this.updateOnlineCurrenciesData(data)
    }
    model.samPresent({do:'changeDataMode', ...data});
  }


};

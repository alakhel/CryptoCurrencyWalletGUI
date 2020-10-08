
//--------------------------------------------------------------------- View ---
// Génération de portions en HTML et affichage
//
view = {

  // Injecte le HTML dans une balise de la page Web.
  samDisplay(sectionId, representation) {
    const section = document.getElementById(sectionId);
    section.innerHTML = representation;
  },

  // Renvoit le HTML de l'interface complète de l'application
  appUI(model, state) {
    const configsChooserHTML = this.configsChooserUI();
    return `
    <div class="container">
      ${configsChooserHTML}
      <h1 class="text-center">Portfolio Cryptos</h1>
      <br />
      <div class="row">
        <div class="col-lg-6">
            ${state.representations.currencies}
        <br />
        </div>

        <div class="col-lg-6">
          ${state.representations.preferences}
          <br />
          ${state.representations.wallet}
          <br />
        </div>
      </div>
    </div>
    `;
  },

  configsChooserUI() {
    const options = Object.keys(configs).map(v => {
      const selected = configsSelected == v ? 'selected="selected"' : '';
      return `
      <option ${selected}>${v}</option>
      `;
    }).join('\n');
    return `
    <div class="row">
      <div class="col-md-7"></div>
      <div class="col-md-5">
      <br />
        <div class="d-flex justify-content-end">
          <div class="input-group">
            <div class="input-group-prepend ">
              <label class="input-group-text">Config initiale :</label>
            </div>
            <select class="custom-select" onchange="actions.reinit({e:event})">
              ${options}
            </select>
          </div>
        </div>
      </div>
    </div>
    <br />
    `;
  },

  currenciesUI(model, state) {
    const tabName = model.ui.currenciesCard.selectedTab;
    switch (tabName) {
      case 'cryptos': return this.currenciesCrytopsUI(model, state); break;
      case 'fiats'  : return this.currenciesFiatsUI  (model, state); break;
      default:
        console.error('view.currenciesUI() : unknown tab name: ', tabName);
        return '<p>Error in view.currenciesUI()</p>';
    }
  },

  currenciesCrytopsUI(model, state) {

    const paginationHTML = this.paginationUI(model, state, 'cryptos');
    const filters = model.ui.currenciesCard.tabs.cryptos.filters;
    const cNum = state.data.cryptos.filteredNum;
    const fNum = state.data.fiats.filteredNum;
    const allCodes = state.data.coins.allCodes;
    const nullValueCodes = state.data.coins.nullValueCodes;
    const posValueCodes = state.data.coins.posValueCodes;
    const index = model.ui.currenciesCard.tabs['cryptos'].pagination.rowsPerPageIndex
    let currentPage = model.ui.currenciesCard.tabs['cryptos'].pagination.currentPage
    const rowsPerPage = model.ui.currenciesCard.tabs['cryptos'].pagination.rowsPerPage[index]
    const icons      = ['↘', '∼', '↗'];
    const changes    = [ 3, 0, 0, -4, -3, 2 ];
    const variations = changes.map( v => icons[ Math.sign(v) + 1 ] );
    currentPage = Math.max(currentPage, 1);
    return `
    <div class="card border-secondary" id="currencies">
      <div class="card-header">
        <ul class="nav nav-pills card-header-tabs">
          <li class="nav-item">
            <a class="nav-link active" href="#currencies"> Cryptos <span
                class="badge badge-light">${cNum} / 386</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-secondary" href="#currencies"
              onclick="actions.changeTab({tab:'currenciesFiats'})"> Monnaies cibles
              <span class="badge badge-secondary">${fNum} / 167</span></a>
          </li>
        </ul>
      </div>
      <div class="card-body">
        <div class="input-group">
          <div class="input-group-append">
            <span class="input-group-text">Filtres : </span>
          </div>
          <input value="${filters.text}" id="filterText" type="text" class="form-control"
            placeholder="code ou nom..." onchange="actions.filtreCurrencyName({e:event})"/>
          <div class="input-group-append">
            <span class="input-group-text">Prix &gt; </span>
          </div>
          <input id="filterSup" type="number" class="form-control" value="${filters.price}"
          min="0" onchange="actions.filtreCurrencyPrice({e:event})"/>
        </div> <br />
        <div class="table-responsive">
          <table class="col-12 table table-sm table-bordered">
            <thead>
              <th class="align-middle text-center col-2">
                <a href="#currencies" onclick="actions.sortOrder({id : 0, currency:'cryptos'})">Code</a>
              </th>
              <th class="align-middle text-center col-5">
                <a href="#currencies" onclick="actions.sortOrder({id : 1, currency:'cryptos'})">Nom</a>
              </th>
              <th class="align-middle text-center col-2">
                <a href="#currencies" onclick="actions.sortOrder({id : 2, currency:'cryptos'})">Prix</a>
              </th>
              <th class="align-middle text-center col-3">
                <a href="#currencies" onclick="actions.sortOrder({id : 3, currency:'cryptos'})">Variation</a>
              </th>
            </thead>

            ${ state.data.cryptos.filtered.map( (v, i) =>

             `<tr ${  (i >=(currentPage *(rowsPerPage)) || i <(currentPage * (rowsPerPage) ) - (rowsPerPage)) ? 'id=\"hiden\"' : ''} ${nullValueCodes.includes(v.code)? 'class=\"bg-warning\"':''}  ${posValueCodes.includes(v.code)? 'class=\"bg-success text-light\"':''}
              onclick="actions.addCurrency({e:event, code : '${v.code}'})">
              <td class="text-center">
                <span class="badge badge-pill badge-light">
                  <img src="${v.icon_url}" /> ${v.code}
                </span></td>
              <td><b>${v.name}</b></td>
              <td class="text-right"><b>${v.price.toFixed(2)}</b></td>
              <td class="text-right">${v.change.toFixed(3)+ ' '}${icons[ Math.sign(v.change) + 1 ]}</td>
            </tr>
            `).join('\n')
            }

          </table>
        </div>
        ${paginationHTML}
      </div>
      <div class="card-footer text-muted"> Cryptos préférées :
      ${ allCodes.map( (v, i) =>
      `<span ${nullValueCodes.includes(v)? 'class=\"badge badge-warning\"':''}  ${posValueCodes.includes(v)? 'class=\"badge badge-success\"':''}>
      ${v}
      </span>`).join("\n")
    }
      </div>
    </div>
    `;
  },

  paginationUI(model, state, currency) {
    const pagination = model.ui.currenciesCard.tabs[currency].pagination;
    const nbPages = state.ui.currenciesCard.tabs[currency].pagination.nbPages;
    let currentPage = pagination.currentPage
    currentPage = Math.max(currentPage, 1);
    const maxPages = pagination.maxPages;
    let page_number=``;
    //let j = 0;
    console.log(currentPage);
    let start = currentPage - Math.floor(maxPages*0.5)
    start = start < 0 ? 1 : ++start;
    let end = start + maxPages -1
    end =  end < nbPages ? end : nbPages;
    start = end - maxPages
    start = start <= 0 ? 1 : ++start;
    let j = start;
    for(;j<= end; j++){
              page_number +=  `<li class="page-item ${j == currentPage? 'active' : ''}" onclick="actions.currentPage({value : '${j}',currency : '${currency}'})">
                  <a class="page-link" href="#currencies">${j}</a>
                </li>`;
              //  j++;
              //  if (j==8) break
              };

    return `
    <section id="pagination">
      <div class="row justify-content-center">
        <nav class="col-auto">
          <ul class="pagination">
            <li class="page-item ${currentPage<=1? 'disabled' : ''}"  onclick="actions.currentPageMoins({currency : '${currency}'})">
              <a class="page-link" href="#currencies" >&lt;</a>
            </li>

          ${page_number}

            <li class="page-item ${currentPage >=nbPages? 'disabled' : ''}" onclick="actions.currentPagePlus({currency : '${currency}'})">
              <a class="page-link" href="#currencies" >&gt;</a>
            </li>
          </ul>
        </nav>
        <div class="col-auto">
          <div class="input-group mb-3">
            <select class="custom-select" id="selectTo" onchange="actions.changeNbrPage({e:event, currency :'${currency}'})">
            ${pagination.rowsPerPage.map( (v,i)=>
              `<option ${i==pagination.rowsPerPageIndex ? 'selected=\"selected\"' : ''} value="${i}">${v}</option>`).join('\n')}
            </select>
            <div class="input-group-append">
              <span class="input-group-text">par page</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  },

  currenciesFiatsUI(model,state) {

    const paginationHTML = this.paginationUI(model, state, 'fiats');
    const filters = model.ui.currenciesCard.tabs.fiats.filters;
    const cNum = state.data.cryptos.filteredNum;
    const fNum = state.data.fiats.filteredNum;
    const targets = model.config.targets
    const index = model.ui.currenciesCard.tabs['fiats'].pagination.rowsPerPageIndex
    let currentPage = model.ui.currenciesCard.tabs['fiats'].pagination.currentPage
    const rowsPerPage = model.ui.currenciesCard.tabs['fiats'].pagination.rowsPerPage[index]
    currentPage = Math.max(currentPage, 1);

    return `
    <div class="card border-secondary"
      id="currencies">
      <div class="card-header">
        <ul class="nav nav-pills card-header-tabs">
          <li class="nav-item">
            <a class="nav-link text-secondary" href="#currencies"
              onclick="actions.changeTab({tab:'currenciesCryptos'})"> Cryptos <span
                class="badge badge-secondary">${cNum} / 386</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="#currencies">Monnaies cibles <span
                class="badge badge-light">${fNum} / 167</span></a>
          </li>
        </ul>
      </div>
      <div class="card-body">
        <div class="input-group">
          <div class="input-group-append">
            <span class="input-group-text">Filtres : </span>
          </div>
          <input value="${filters.text}" id="filterText" type="text" class="form-control"
            placeholder="code ou nom..." onchange="actions.filtreMonnaie({e:event})"/>
        </div> <br />
        <div>
        <table class="col-12 table table-sm table-bordered">
          <thead>
            <th class="align-middle text-center col-2">
              <a href="#currencies" onclick="actions.sortOrder({id : 0, currency:'fiats'})">Code</a>
            </th>
            <th class="align-middle text-center col-5">
              <a href="#currencies" onclick="actions.sortOrder({id : 1, currency:'fiats'})">Nom</a>
            </th>
            <th class="align-middle text-center col-2">
              <a href="#currencies" onclick="actions.sortOrder({id : 2, currency:'fiats'})">Symbole</a>
            </th>
          </thead>
          ${ state.data.fiats.filtered.map( (v, i) =>
          `<tr ${(i >=(currentPage *(rowsPerPage)) || i <(currentPage * (rowsPerPage) ) - (rowsPerPage)) ? 'id=\"hiden\"' : ''} class="${ v.code == targets.active ? 'bg-success' :targets.list.indexOf(v.code) >=0 ?  'bg-warning' : ''}" onclick="actions.addFiats({code : '${v.code}'})">
            <td class="text-center"><b>${v.code}</b></td>
            <td><b>${v.name}</b></td>
            <td class="text-right"><b>${v.symbol}</b></td>
          </tr>`).join("\n")
          }

        </table>
        </div><br />
        ${paginationHTML}
      </div>
      <div class="card-footer text-muted"> Monnaies préférées :
      ${targets.list.map( (v,i) =>
         `<span class="badge badge-${ v == targets.active ? 'success' : 'warning'}">${v}</span>`
      ).join('\n')}
      </div>
    </div>
    `;
  },

  preferencesUI(model, state) {

    const authors        = model.config.authors;
    const debug          = model.config.debug;
    const activeTarget   = model.config.targets.active;
    const updateDisabled = model.config.dataMode == 'offline' ? 'disabled="disabled"' : '';
    const target         = model.config.targets.active;
    const targetsList    = mergeUnique(model.config.targets.list,[target]).sort();
    const fiatsList      = state.data.fiats.list;

    const fiatOptionsHTML = targetsList.map( (v) => {
      const code = fiatsList[v].code;
      const name = fiatsList[v].name;
      const isOffline = model.config.dataMode == 'offline';
      const selected = code == target ? 'selected="selected"' : '';
      const disabled = isOffline && code != target ? 'disabled="disabled"' : '';
      return `
      <option value="${code}" ${selected} ${disabled}>${code} - ${name}</option>
      `;
    }).join('\n');

    const dataModeOptionsHTML = [['online', 'En ligne'], ['offline', 'Hors ligne']].map( v => {
      const selected = v[0] == model.config.dataMode ? 'selected="selected"' : '';
      return `<option value="${v[0]}" ${selected}>${v[1]}</option>`;
    }).join('\n');

    return `
    <div class="card border-secondary">
      <div class="card-header d-flex justify-content-between">
        <h5 class=""> Préférences </h5>
        <h5 class="text-secondary"><abbr title="${authors}">Crédits</abbr></h5>
      </div>
      <div class="card-body">
        <div class="input-group">
          <div class="input-group-prepend">
            <label class="input-group-text" for="inputGroupSelect01">Monnaie
              cible</label>
          </div>
          <select class="custom-select" id="inputGroupSelect01"
          onchange="actions.changeTarget({e:event, debug:'${debug}'})">
            ${fiatOptionsHTML}
          </select>
        </div>
        <p></p>
        <div class="input-group">
          <div class="input-group-prepend">
            <label class="input-group-text">Données</label>
          </div>
          <select class="custom-select" onchange="actions.changeDataMode({e:event, target:'${activeTarget}', debug:'${debug}'})">
            ${dataModeOptionsHTML}
          </select>
          <div class="input-group-append">
            <button class="btn btn-primary" ${updateDisabled}
            onclick="actions.updateOnlineCurrenciesData({target: '${activeTarget}', debug:'${debug}'})">
            Actualiser</button>
          </div>
        </div>
      </div>
    </div>
    `;
  },

  walletUI(model, state) {
    const tabName = model.ui.walletCard.selectedTab;
    switch (tabName) {
      case 'portfolio': return this.walletPortfolioUI(model, state); break;
      case 'ajouter'  : return this.walletAjouterUI  (model, state); break;
      default:
        console.error('view.currenciesUI() : unknown tab name: ', tabName);
        return '<p>Error in view.currenciesUI()</p>';
    }
  },

  walletPortfolioUI(model, state) {
    const cryptosList = state.data.cryptos.list;
    const posValueCodes = state.data.coins.posValueCodes;
    const coins = model.config.coins;
    const activeTarget   = model.config.targets.active;
    let totalChanged = false;
    let isValide = true;


    let total =  0;
      posValueCodes.map( (v, i) =>
        total += cryptosList[v].price * (coins[v].quantityNew != ''? (isNaN(parseInt(coins[v].quantityNew)) || coins[v].quantityNew <0 ? 0:parseInt(coins[v].quantityNew) ): coins[v].quantity)       )
        posValueCodes.map( (v, i) => {
        coins[v].quantityNew != ''? totalChanged = true :'';
        isNaN(parseInt(coins[v].quantityNew)) && coins[v].quantityNew != ''?
        isValide= false : '';
        }

      )


    return `
    <div class="card border-secondary text-center" id="wallet">
      <div class="card-header">
        <ul class="nav nav-pills card-header-tabs">
          <li class="nav-item">
            <a class="nav-link active" href="#wallet">Portfolio <span
                class="badge badge-light">${state.data.coins.posValueCodes.length}</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-secondary" href="#wallet"
              onclick="actions.changeTab({tab:'walletAjouter'})"> Ajouter <span
                class="badge badge-secondary">${state.data.coins.nullValueCodes.length}</span></a>
          </li>
        </ul>
      </div>
      <div class="card-body text-center">
        <br />
        <div class="table-responsive">
          <table class="col-12 table table-sm table-bordered">
            <thead>
              <th class="align-middle text-center col-1"> Code </th>
              <th class="align-middle text-center col-4"> Nom </th>
              <th class="align-middle text-center col-2"> Prix </th>
              <th class="align-middle text-center col-3"> Qté </th>
              <th class="align-middle text-center col-2"> Total </th>
            </thead>
            ${state.data.coins.posValueCodes.map( (v, i) =>
           `<tr>
              <td class="text-center">
                <span class="badge badge-pill badge-light">
                  <img src="${cryptosList[v].icon_url}" /> ${cryptosList[v].code}
                </span></td>
              <td><b>${cryptosList[v].name}</b></td>
              <td class="text-right"> ${cryptosList[v].price.toFixed(2)} </td>
              <td class="text-right">
                <input type="text" class="form-control ${coins[v].quantityNew==''?'':parseInt(coins[v].quantityNew)>= 0 ? 'text-primary':'text-danger'}" value="${coins[v].quantityNew != ''? coins[v].quantityNew: coins[v].quantity}"  onchange="actions.changeQteWalletPortofolio({e:event, index : ${i}, code: '${cryptosList[v].code}'})" />
              </td>
              <td class="text-right">

                <span class="${coins[v].quantityNew==''?'':parseInt(coins[v].quantityNew)>= 0 ? 'text-primary':'text-danger'}">
                  <b>${isNaN(parseInt(coins[v].quantityNew)) && !coins[v].quantityNew==''||coins[v].quantityNew<0 ? '???' : (cryptosList[v].price * (coins[v].quantityNew != ''? parseInt(coins[v].quantityNew): coins[v].quantity)).toFixed(2)}</b>
                </span>
                </td>
            </tr>`).join("\n")
            }
          </table>
        </div>
        <div class="input-group d-flex justify-content-end">
          <div class="input-group-prepend">
            <button class="${totalChanged && isValide? 'btn btn-primary':'btn disabled'}" onclick="actions.confirmerWalletPortofolio()">Confirmer</button>
          </div>
          <div class="input-group-append">
            <button class="${totalChanged? 'btn btn-secondary':'btn disabled'}" onclick="actions.annulerWalletPortofolio()">Annuler</button>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <h3><span class="${totalChanged? 'badge badge-primary':'badge badge-success'}">Total : ${total.toFixed(2)} ${ activeTarget} </span></h3>
      </div>
    </div>
    `;
  },

  walletAjouterUI(model, state) {
    const cryptosList = state.data.cryptos.list;
    const coins = model.config.coins;
    const nullValueCodes = state.data.coins.nullValueCodes;
    const activeTarget   = model.config.targets.active;
    let isValide = true;
    let totalChanged = false;
    let total =  0;
      nullValueCodes.map( (v, i) =>
        total += cryptosList[v].price * ((isNaN(parseInt(coins[v].quantityNew)) ||coins[v].quantityNew<0 )? 0 :parseInt(coins[v].quantityNew)))
        nullValueCodes.map( (v, i) => {coins[v].quantityNew != ''? totalChanged = true :''
        isNaN(parseInt(coins[v].quantityNew)) && coins[v].quantityNew != ''?
        isValide= false : '';}
      )


    return `
    <div class="card border-secondary text-center" id="wallet">
      <div class="card-header">
        <ul class="nav nav-pills card-header-tabs">
          <li class="nav-item">
            <a class="nav-link text-secondary" href="#wallet"
              onclick="actions.changeTab({tab:'walletPortfolio'})"> Portfolio <span
                class="badge badge-secondary">${state.data.coins.posValueCodes.length}</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="#wallet">Ajouter <span
                class="badge badge-light">${state.data.coins.nullValueCodes.length}</span></a>
          </li>
        </ul>
      </div>
      <div class="card-body">
        <br />
        <div class="table-responsive">
          <table class="col-12 table table-sm table-bordered">
            <thead>
              <th class="align-middle text-center col-1"> Code </th>
              <th class="align-middle text-center col-4"> Nom </th>
              <th class="align-middle text-center col-2"> Prix </th>
              <th class="align-middle text-center col-3"> Qté </th>
              <th class="align-middle text-center col-2"> Total </th>
            </thead>
            ${state.data.coins.nullValueCodes.map( (v, i) =>
              `<tr>
                 <td class="text-center">
                   <span class="badge badge-pill badge-light">
                     <img src="${cryptosList[v].icon_url}" /> ${cryptosList[v].code}
                   </span></td>
                 <td><b>${cryptosList[v].name}</b></td>
                 <td class="text-right"> ${cryptosList[v].price.toFixed(2)} </td>

                 <td class="text-right">
                   <input type="text" class="form-control ${coins[v].quantityNew==''?'':parseInt(coins[v].quantityNew)>= 0 ? 'text-primary':'text-danger'}" value="${coins[v].quantityNew != '' ? coins[v].quantityNew: 0}"
                   onchange="actions.changeQteWalletAjouter({e:event, index : ${i}, code: '${cryptosList[v].code}'})"/>
                 </td>
                 <!-- TOTAL -->
                 <td class="text-right">
                    <span class="${coins[v].quantityNew==''?'':parseInt(coins[v].quantityNew)>= 0 ? 'text-primary':'text-danger'}">
                      <b>${isNaN(parseInt(coins[v].quantityNew)) && !coins[v].quantityNew ==''  ||coins[v].quantityNew<0 ? '???' : (cryptosList[v].price * coins[v].quantityNew ==''?0:parseInt(coins[v].quantityNew)).toFixed(2)}</b>
                      </span>
                 </td>
               </tr>`).join("\n")
            }
          </table>
        </div>
        <div class="input-group d-flex justify-content-end">
          <div class="input-group-prepend">
            <button class="${totalChanged && isValide? 'btn btn-primary':'btn disabled'}" onclick="actions.confirmerWalletAjouter()">Confirmer</button>
          </div>
          <div class="input-group-append">
            <button class="${totalChanged? 'btn btn-secondary':'btn disabled'}" onclick="actions.annulerWalletAjouter()">Annuler</button>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <h3><span class="${totalChanged? 'badge badge-primary':'badge badge-success'}">Total : ${total.toFixed(2)} ${activeTarget}</span></h3>
      </div>
    </div>
    `;
  },


};

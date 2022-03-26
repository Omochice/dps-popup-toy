if get(g:, 'loaded_dps_popup_test', v:false)
  finish
endif
let g:loaded_dps_popup_test = v:true

command! DpsPopupToy call dps_popup_toy#open(['Hello', 'Popup', 'With denops.vim'])
nnoremap <silent> <Plug>(popup_toy) <Cmd>DpsPopupToy<CR>

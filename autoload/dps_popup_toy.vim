function! dps_popup_toy#open(contents) abort
   call denops#plugin#wait('popup-toy')
   call denops#notify('popup-toy', 'show', a:contents)
endfunction

const generarIdEstable = (postExcel, prefijo) => {
  // 1. Buscamos cualquier llave que contenga la palabra "ID" o "id"
  const keys = Object.keys(postExcel)
  const idKey = keys.find(k => k.toLowerCase().includes('post id') || k.toLowerCase().trim() === 'id')

  if (idKey && postExcel[idKey]) {
    return String(postExcel[idKey]).trim() // Lo devolvemos limpiecito
  }

  // 2. Si Hootsuite no mandó ID, usamos su Link como ID (El link es único y no cambia al recargar)
  const link = postExcel['Post URL'] || postExcel.postPermalink || postExcel.permalink || ''
  if (link) {
    // Tomamos los últimos 15 caracteres del link para hacerlo un ID válido
    return prefijo + '_' + link.replace(/[^a-zA-Z0-9]/g, '').slice(-15)
  }

  // 3. Último recurso absoluto: usamos un pedacito de su texto
  const texto = postExcel.mensaje || postExcel['Message'] || 'sin_texto'
  return prefijo + '_' + texto.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
}

const formatFacebookPosts = (publicacionesFb, fbHootsuiteData) => {
  return (publicacionesFb || [])
    .map(postExcel => {
      // Usamos nuestro cazador de IDs
      const postId = generarIdEstable(postExcel, 'fb')
      const postPermalink = postExcel['Post URL'] || postExcel.postPermalink || postExcel.permalink || ''

      let imagenMapeada = 'https://placehold.co/300x400/00eb5d/ffffff?text=Post+Sin+Imagen'
      let tipoPost = postExcel.tipoPost || 'POST'

      if (fbHootsuiteData && fbHootsuiteData.realPosts) {
        const textoCortoExcel = (postExcel.mensaje || '').substring(0, 20).trim()
        const postCoincidente = fbHootsuiteData.realPosts.find(p => p.text && p.text.includes(textoCortoExcel))

        if (postCoincidente) {
          if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 0) {
            imagenMapeada = postCoincidente.mediaUrls[0].thumbnailUrl || postCoincidente.mediaUrls[0].url
          }
          if (postCoincidente.postUrl && postCoincidente.postUrl.includes('reel')) tipoPost = 'REEL'
          else if (postCoincidente.mediaUrls && postCoincidente.mediaUrls[0] && postCoincidente.mediaUrls[0].url.includes('.mp4')) tipoPost = 'VIDEO'
        }
      }

      return {
        id: postId,
        link: postPermalink,
        type: tipoPost,
        views: postExcel.visitas,
        reach: postExcel.alcance,
        interactions: postExcel.interacciones,
        saved: postExcel.shares,
        picture: imagenMapeada,
        img: imagenMapeada,
        postPermalink: postPermalink,
        text: postExcel.mensaje ? postExcel.mensaje.substring(0, 60) + '...' : 'Sin texto',
        date: postExcel.fecha ? postExcel.fecha.split(' ')[0] : 'Sin fecha',
        tags: postExcel.tags || 'Sin etiqueta',
      }
    })
    .sort((a, b) => b.views - a.views)
}

const formatInstagramPosts = (publicacionesIg, igHootsuiteData) => {
  const igPostsList = []
  const igStoriesList = []

  ;(publicacionesIg || []).forEach(postExcel => {
    // Usamos nuestro cazador de IDs
    const postId = generarIdEstable(postExcel, 'ig')
    const postPermalink = postExcel['Post URL'] || postExcel.postPermalink || postExcel.permalink || ''

    let imagenMapeada = 'https://placehold.co/300x400/ff7375/ffffff?text=IG+Sin+Imagen'
    let tipoPost = (postExcel.tipoPost || 'POST').toUpperCase()

    if (tipoPost.includes('STORY')) {
      imagenMapeada = 'https://placehold.co/300x533/00eb5d/ffffff?text=IG+Story'
      if (postPermalink && postPermalink.includes('scontent')) {
        imagenMapeada = postPermalink
      }
    }

    if (igHootsuiteData && igHootsuiteData.realPosts) {
      const urlLimpiaExcel = (postPermalink || '').split('?')[0].replace(/\/$/, '')
      const postCoincidente = igHootsuiteData.realPosts.find(p => {
        const urlLimpiaApi = (p.postUrl || '').split('?')[0].replace(/\/$/, '')
        return urlLimpiaApi === urlLimpiaExcel || (urlLimpiaApi !== '' && urlLimpiaExcel.includes(urlLimpiaApi))
      })

      if (postCoincidente) {
        if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 0) {
          imagenMapeada = postCoincidente.mediaUrls[0].thumbnailUrl || postCoincidente.mediaUrls[0].url
        }
        if (!tipoPost.includes('STORY')) {
          if (postCoincidente.postUrl && postCoincidente.postUrl.includes('reel')) tipoPost = 'REEL'
          else if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 1) tipoPost = 'CAROUSEL'
        }
      }
    }

    const postFormateado = {
      id: postId,
      link: postPermalink,
      type: tipoPost.includes('STORY') ? 'STORY' : tipoPost,
      views: postExcel.visitas || 0,
      reach: postExcel.alcance || 0,
      interactions: postExcel.interacciones || 0,
      saved: postExcel.saves || 0,
      likes: postExcel.likes || 0,
      shares: postExcel.shares || 0,
      picture: imagenMapeada,
      img: imagenMapeada,
      postPermalink: postPermalink,
      text: postExcel.mensaje ? postExcel.mensaje.substring(0, 60) + '...' : 'Historia sin texto',
      date: postExcel.fecha ? postExcel.fecha.split(' ')[0] : 'Sin fecha',
      tags: postExcel.tags || 'Sin etiqueta',
    }

    if (tipoPost.includes('STORY')) igStoriesList.push(postFormateado)
    else igPostsList.push(postFormateado)
  })

  return {
    topPostsIg: igPostsList.sort((a, b) => b.views - a.views),
    topStoriesIg: igStoriesList.sort((a, b) => b.views - a.views),
  }
}

const formatCasData = kpisManuales => {
  const dynamicCas = []
  if (kpisManuales) {
    for (const key in kpisManuales) {
      if (key.startsWith('cas_')) {
        let label = key.replace('cas_', '').replace(/_/g, ' ')
        label = label.charAt(0).toUpperCase() + label.slice(1)
        dynamicCas.push({
          label: label,
          value: parseFloat(kpisManuales[key]) || 0,
        })
      }
    }
  }
  return dynamicCas.sort((a, b) => b.value - a.value)
}

module.exports = {
  formatFacebookPosts,
  formatInstagramPosts,
  formatCasData,
}
